import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

loadEnv(resolve(root, ".env.local"));

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const dryRun = process.argv.includes("--dry-run");
const managedMediaPattern =
  /<!-- jqit-managed-media:start -->[\s\S]*?<!-- jqit-managed-media:end -->\s*/;

const newsMedia = [
  {
    id: "site-renewal-2026",
    eyecatch: {
      path: "public/natural-tech-wide.webp",
      width: 1915,
      height: 821,
    },
  },
  {
    id: "soukai-202604",
    eyecatch: {
      path: "public/news/soukai-202604.jpg",
      width: 1600,
      height: 1200,
    },
    gallery: [
      {
        path: "public/news/soukai-202604.jpg",
        width: 1600,
        height: 1200,
      },
      {
        path: "public/news/kouryu-202604.jpg",
        width: 1600,
        height: 1200,
      },
    ],
  },
  {
    id: "kouryu-202604",
    eyecatch: {
      path: "public/news/kouryu-202604.jpg",
      width: 1600,
      height: 1200,
    },
  },
  {
    id: "iso27001-isms-20260306",
    eyecatch: {
      path: "public/badges/isms-iso27001.png",
      width: 3300,
      height: 1279,
    },
  },
];

if (!serviceDomain || !apiKey) {
  fail("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を .env.local に設定してください。");
}

const uploadedUrls = new Map();

for (const item of newsMedia) {
  const fields = {};
  const contentMedia = {};

  if (item.eyecatch) {
    const url = await uploadMedia(item.eyecatch.path);
    fields.eyecatch = url;
    contentMedia.eyecatch = { ...item.eyecatch, url };
  }

  if (item.gallery?.length) {
    fields.gallery = [];
    contentMedia.gallery = [];
    for (const image of item.gallery) {
      const url = await uploadMedia(image.path);
      fields.gallery.push(url);
      contentMedia.gallery.push({ ...image, url });
    }
  }

  const patched = await patchNews(item.id, fields);
  if (!patched) {
    await patchNewsContentImages(item.id, contentMedia);
  }
}

console.log("microCMSニュース画像の同期が完了しました。");

function loadEnv(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue
      .replace(/^(['"])(.*)\1$/, "$2")
      .replace(/\\n/g, "\n");
  }
}

async function uploadMedia(relativePath) {
  const filePath = resolve(root, relativePath);
  if (!existsSync(filePath)) {
    fail(`${relativePath} が見つかりません。`);
  }

  const size = statSync(filePath).size;
  if (size > 5 * 1024 * 1024) {
    fail(`${relativePath} は5MBを超えています。microCMSのメディアアップロード上限内に圧縮してください。`);
  }

  if (uploadedUrls.has(relativePath)) {
    return uploadedUrls.get(relativePath);
  }

  if (dryRun) {
    const dummyUrl = `https://example.microcms-assets.io/assets/dry-run/${basename(relativePath)}`;
    uploadedUrls.set(relativePath, dummyUrl);
    console.log(`[dry-run] upload ${relativePath}`);
    return dummyUrl;
  }

  const form = new FormData();
  const blob = new Blob([readFileSync(filePath)], { type: mimeType(filePath) });
  form.append("file", blob, basename(filePath));

  const res = await fetch(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
    },
    body: form,
  });

  const body = await readResponse(res);
  if (!res.ok) {
    fail(
      `メディアアップロードに失敗しました: ${relativePath} (${res.status})\n` +
        `${body}\n` +
        "APIキーに「メディアアップロード」権限があるか確認してください。",
    );
  }

  const url = JSON.parse(body).url;
  uploadedUrls.set(relativePath, url);
  console.log(`uploaded ${relativePath}`);
  return url;
}

async function patchNews(id, fields) {
  if (dryRun) {
    console.log(`[dry-run] patch news/${id}: ${Object.keys(fields).join(", ")}`);
    return true;
  }

  const res = await fetch(`https://${serviceDomain}.microcms.io/api/v1/news/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": apiKey,
    },
    body: JSON.stringify(fields),
  });

  const body = await readResponse(res);
  if (!res.ok) {
    if (res.status === 400 && /unexpected key/.test(body)) {
      console.log(`news/${id}: 画像フィールドが未定義のため、content本文へ画像を挿入します。`);
      return false;
    }

    fail(`news/${id} の画像フィールド更新に失敗しました (${res.status})\n${body}`);
  }

  console.log(`patched news/${id}`);
  return true;
}

async function patchNewsContentImages(id, media) {
  if (dryRun) {
    console.log(`[dry-run] patch news/${id}: content managed media block`);
    return;
  }

  const current = await fetchJson(`https://${serviceDomain}.microcms.io/api/v1/news/${id}`);
  const content = typeof current.content === "string" ? current.content : "";
  const nextContent = `${buildManagedMediaBlock(media)}\n${content.replace(managedMediaPattern, "")}`;

  const res = await fetch(`https://${serviceDomain}.microcms.io/api/v1/news/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": apiKey,
    },
    body: JSON.stringify({ content: nextContent }),
  });

  const body = await readResponse(res);
  if (!res.ok) {
    fail(`news/${id} のcontent画像挿入に失敗しました (${res.status})\n${body}`);
  }

  console.log(`patched news/${id}: content`);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
    },
  });
  const body = await readResponse(res);
  if (!res.ok) {
    fail(`microCMSから現在の記事を取得できませんでした (${res.status})\n${body}`);
  }
  return JSON.parse(body);
}

function buildManagedMediaBlock(media) {
  const images = [
    media.eyecatch,
    ...(media.gallery ?? []).filter((image) => image.url !== media.eyecatch?.url),
  ].filter(Boolean);

  const figures = images
    .map(
      (image) =>
        `<figure><img src="${escapeHtml(image.url)}" alt="" width="${image.width}" height="${image.height}"></figure>`,
    )
    .join("\n");

  return `<!-- jqit-managed-media:start -->\n${figures}\n<!-- jqit-managed-media:end -->`;
}

async function readResponse(res) {
  const text = await res.text();
  return text || "(empty response)";
}

function mimeType(path) {
  switch (extname(path).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
