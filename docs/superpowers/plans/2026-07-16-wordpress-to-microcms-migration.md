# WordPress to microCMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 旧WordPressの公開投稿30件のうち重複3件を除く27件を、画像込みでmicroCMS `news`へ再実行可能な方法で下書き移行する。

**Architecture:** 変換ロジック、外部APIクライアント、移行オーケストレーター、CLIを分離する。CLIは通常dry-runで動作し、`--apply`指定時だけ画像アップロードと下書き作成を行い、進捗をJSONマニフェストへ逐次保存する。

**Tech Stack:** Node.js 24、Node.js組み込みTest Runner、`sanitize-html`、WordPress REST API、microCMS Content API / Management API

## Global Constraints

- WordPress公開投稿30件を入力とする。
- `soukai-202604`、`kouryu-202604`、`iso27001-isms-20260306`は既存microCMS記事を維持し、上書きしない。
- `site-renewal-2026`は移行対象外とする。
- 新規27件は`status=draft`で作成し、公開しない。
- 新規コンテンツIDは`wp-{WordPress投稿ID}`とする。
- WordPress画像URLを最終本文に残さない。
- 画像アップロード上限は5MBとし、超過時は該当記事を作成しない。
- APIキー、本文全体、個人情報をログやマニフェストへ保存しない。
- `--apply`がない限りmicroCMSを変更しない。
- 既存コンテンツIDが存在する場合はスキップし、上書きしない。
- 公開日はWordPress投稿日の年月日を`00:00:00.000Z`へ正規化して`publishedAt`に設定する。

---

## File Structure

- Create: `scripts/lib/wordpress-news-transform.mjs` — 投稿ID、カテゴリ、画像一覧、本文HTML、microCMS payloadの純粋変換
- Create: `scripts/lib/wordpress-news-source.mjs` — WordPress REST API取得とレスポンス検証
- Create: `scripts/lib/microcms-migration-client.mjs` — microCMS一覧取得、画像アップロード、下書き作成
- Create: `scripts/lib/wordpress-news-migration.mjs` — 30件の計画作成、重複スキップ、逐次実行、マニフェスト更新
- Create: `scripts/migrate-wordpress-news.mjs` — `.env.local`読込とCLI引数処理
- Create: `scripts/verify-wordpress-news-migration.mjs` — 下書き状態、本文、公開日、画像URLの完全性検証
- Create: `tests/scripts/wordpress-news-transform.test.mjs` — 純粋変換の単体テスト
- Create: `tests/scripts/wordpress-news-source.test.mjs` — WordPress APIクライアントの単体テスト
- Create: `tests/scripts/microcms-migration-client.test.mjs` — microCMS APIクライアントの単体テスト
- Create: `tests/scripts/wordpress-news-migration.test.mjs` — dry-run、重複、再実行、失敗継続の統合テスト
- Create: `scripts/data/wordpress-news-migration.json` — 旧URL、新ID、画像URL対応、処理状態を保持するマニフェスト
- Modify: `package.json` — テストと移行コマンドを追加
- Modify: `README.md` — 移行コマンド、権限、確認手順を追記

---

### Task 1: WordPress投稿の純粋変換

**Files:**
- Create: `scripts/lib/wordpress-news-transform.mjs`
- Test: `tests/scripts/wordpress-news-transform.test.mjs`

**Interfaces:**
- Consumes: WordPress REST APIの投稿オブジェクト、`Map<string, string>`形式の画像URL対応表、カテゴリ参照ID
- Produces: `contentIdFor(post)`, `classifyCategory(title)`, `extractImageUrls(html)`, `rewriteAndSanitizeContent(args)`, `buildDraftPayload(args)`

- [ ] **Step 1: 変換仕様を固定する失敗テストを書く**

```js
// tests/scripts/wordpress-news-transform.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDraftPayload,
  classifyCategory,
  contentIdFor,
  extractImageUrls,
  rewriteAndSanitizeContent,
} from "../../scripts/lib/wordpress-news-transform.mjs";

test("contentIdFor uses the WordPress numeric ID", () => {
  assert.equal(contentIdFor({ id: 2098 }), "wp-2098");
});

test("classifyCategory maps company activities to イベント", () => {
  for (const title of ["社員総会", "ランチ会", "2025年 忘年会", "女子会イベント", "9月帰社会"]) {
    assert.equal(classifyCategory(title), "イベント");
  }
  assert.equal(classifyCategory("DX認定を取得しました"), "お知らせ");
});

test("extractImageUrls deduplicates src attributes", () => {
  const html = '<p><img src="https://jqit.co.jp/a.jpg"></p><img src="https://jqit.co.jp/a.jpg"><img src="https://jqit.co.jp/b.png">';
  assert.deepEqual(extractImageUrls(html), [
    "https://jqit.co.jp/a.jpg",
    "https://jqit.co.jp/b.png",
  ]);
});

test("rewriteAndSanitizeContent rewrites images and removes WordPress attributes", () => {
  const html = '<div class="wp-block"><script>alert(1)</script><p>本文</p><img class="size-full" loading="lazy" src="https://jqit.co.jp/a.jpg" srcset="https://jqit.co.jp/a-2x.jpg 2x" alt="写真"></div>';
  const content = rewriteAndSanitizeContent({
    html,
    featuredUrl: "https://jqit.co.jp/featured.jpg",
    imageMap: new Map([
      ["https://jqit.co.jp/a.jpg", "https://images.microcms-assets.io/assets/test/a.jpg"],
      ["https://jqit.co.jp/featured.jpg", "https://images.microcms-assets.io/assets/test/featured.jpg"],
    ]),
  });

  assert.match(content, /featured\.jpg/);
  assert.match(content, /assets\/test\/a\.jpg/);
  assert.doesNotMatch(content, /jqit\.co\.jp/);
  assert.doesNotMatch(content, /script|srcset|loading|class=/);
});

test("buildDraftPayload preserves title, date, category reference, and content", () => {
  const payload = buildDraftPayload({
    post: {
      title: { rendered: "社員&amp;交流" },
      date: "2025-11-29T00:37:24",
    },
    categoryId: "event-category-id",
    content: "<p>本文</p>",
  });

  assert.deepEqual(payload, {
    title: "社員&交流",
    category: "event-category-id",
    content: "<p>本文</p>",
    publishedAt: "2025-11-29T00:00:00.000Z",
  });
});
```

- [ ] **Step 2: テストがモジュール未作成で失敗することを確認する**

Run: `node --test tests/scripts/wordpress-news-transform.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `wordpress-news-transform.mjs`.

- [ ] **Step 3: 最小の変換モジュールを実装する**

```js
// scripts/lib/wordpress-news-transform.mjs
import sanitizeHtml from "sanitize-html";

const EVENT_TITLE_PATTERN = /総会|交流|ランチ|忘年会|イベント|帰社会|女子会|成果発表|会社の日常/;
const IMG_SRC_PATTERN = /<img\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;

export function contentIdFor(post) {
  if (!Number.isInteger(post?.id)) throw new Error("WordPress post ID must be an integer");
  return `wp-${post.id}`;
}

export function classifyCategory(title) {
  return EVENT_TITLE_PATTERN.test(decodeHtml(title)) ? "イベント" : "お知らせ";
}

export function extractImageUrls(html) {
  const urls = [];
  const seen = new Set();
  for (const match of String(html ?? "").matchAll(IMG_SRC_PATTERN)) {
    const url = decodeHtml(match[1]);
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function rewriteAndSanitizeContent({ html, featuredUrl, imageMap }) {
  let rewritten = String(html ?? "");
  for (const [source, target] of imageMap) {
    rewritten = rewritten.replaceAll(source, target).replaceAll(escapeAttribute(source), target);
  }

  const featuredTarget = featuredUrl ? imageMap.get(featuredUrl) : undefined;
  const firstBodyImage = extractImageUrls(rewritten)[0];
  const featuredBlock = featuredTarget && featuredTarget !== firstBodyImage
    ? `<figure><img src="${escapeAttribute(featuredTarget)}" alt=""></figure>`
    : "";

  const clean = sanitizeHtml(`${featuredBlock}${rewritten}`, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "blockquote", "a", "figure", "figcaption", "img", "hr"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => attribs.target === "_blank"
        ? { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }
        : { tagName, attribs },
    },
  }).trim();

  if (/jqit\.co\.jp\/hp\/wp-content\/uploads/i.test(clean)) {
    throw new Error("Unmigrated WordPress image URL remains in content");
  }
  return clean;
}

export function buildDraftPayload({ post, categoryId, content }) {
  return {
    title: decodeHtml(post.title.rendered).replace(/<[^>]+>/g, "").trim(),
    category: categoryId,
    content,
    publishedAt: `${post.date.slice(0, 10)}T00:00:00.000Z`,
  };
}

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}
```

- [ ] **Step 4: 変換テストを通す**

Run: `node --test tests/scripts/wordpress-news-transform.test.mjs`

Expected: 5 tests PASS.

- [ ] **Step 5: 変換モジュールをコミットする**

```bash
git add scripts/lib/wordpress-news-transform.mjs tests/scripts/wordpress-news-transform.test.mjs
git commit -m "Add WordPress news transformation"
```

---

### Task 2: WordPressとmicroCMSのAPIクライアント

**Files:**
- Create: `scripts/lib/wordpress-news-source.mjs`
- Create: `scripts/lib/microcms-migration-client.mjs`
- Test: `tests/scripts/wordpress-news-source.test.mjs`
- Test: `tests/scripts/microcms-migration-client.test.mjs`

**Interfaces:**
- Consumes: `fetch`互換関数、WordPress API URL、microCMS service domain/API key
- Produces: `fetchWordPressPosts`, `featuredImageUrl`, `createMicroCmsMigrationClient`（`listNews`, `listManagedNews`, `getDraft`, `uploadMedia`, `putDraft`）

- [ ] **Step 1: WordPress取得クライアントの失敗テストを書く**

```js
// tests/scripts/wordpress-news-source.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { featuredImageUrl, fetchWordPressPosts } from "../../scripts/lib/wordpress-news-source.mjs";

test("fetchWordPressPosts requires exactly 30 published posts", async () => {
  const fetchImpl = async () => new Response(JSON.stringify([{ id: 1, status: "publish" }]), {
    status: 200,
    headers: { "X-WP-Total": "1" },
  });
  await assert.rejects(() => fetchWordPressPosts({ fetchImpl }), /Expected 30 WordPress posts, received 1/);
});

test("featuredImageUrl reads the embedded source URL", () => {
  assert.equal(featuredImageUrl({
    _embedded: { "wp:featuredmedia": [{ source_url: "https://jqit.co.jp/featured.jpg" }] },
  }), "https://jqit.co.jp/featured.jpg");
});
```

- [ ] **Step 2: microCMSクライアントの失敗テストを書く**

```js
// tests/scripts/microcms-migration-client.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { createMicroCmsMigrationClient } from "../../scripts/lib/microcms-migration-client.mjs";

test("putDraft uses PUT, status=draft, and the requested content ID", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ id: "wp-1" }), { status: 201 });
  };
  const client = createMicroCmsMigrationClient({ serviceDomain: "service", apiKey: "secret", fetchImpl });
  await client.putDraft("wp-1", { title: "Title" });
  assert.equal(calls[0].url, "https://service.microcms.io/api/v1/news/wp-1?status=draft");
  assert.equal(calls[0].options.method, "PUT");
  assert.deepEqual(JSON.parse(calls[0].options.body), { title: "Title" });
});

test("uploadMedia rejects files larger than 5MB before fetch", async () => {
  const client = createMicroCmsMigrationClient({
    serviceDomain: "service",
    apiKey: "secret",
    fetchImpl: async () => { throw new Error("fetch must not run"); },
  });
  await assert.rejects(
    () => client.uploadMedia({ bytes: new Uint8Array(5 * 1024 * 1024 + 1), fileName: "large.png", contentType: "image/png" }),
    /exceeds microCMS 5MB limit/,
  );
});

test("listManagedNews and getDraft use management metadata and draftKey", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.includes("microcms-management.io")) {
      return new Response(JSON.stringify({ contents: [{ id: "wp-1", status: ["DRAFT"], draftKey: "draft-key" }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "wp-1", title: "Title", content: "<p>Body</p>" }), { status: 200 });
  };
  const client = createMicroCmsMigrationClient({ serviceDomain: "service", apiKey: "secret", fetchImpl });
  await client.listManagedNews();
  await client.getDraft("wp-1", "draft-key");
  assert.equal(calls[0], "https://service.microcms-management.io/api/v1/contents/news?limit=100");
  assert.equal(calls[1], "https://service.microcms.io/api/v1/news/wp-1?draftKey=draft-key");
});
```

- [ ] **Step 3: 両テストがモジュール未作成で失敗することを確認する**

Run: `node --test tests/scripts/wordpress-news-source.test.mjs tests/scripts/microcms-migration-client.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for both client modules.

- [ ] **Step 4: WordPress取得クライアントを実装する**

```js
// scripts/lib/wordpress-news-source.mjs
const DEFAULT_URL = "https://jqit.co.jp/wp-json/wp/v2/posts?per_page=100&_embed=1&orderby=date&order=desc";

export async function fetchWordPressPosts({ fetchImpl = fetch, url = DEFAULT_URL } = {}) {
  const response = await fetchImpl(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`WordPress API failed with HTTP ${response.status}`);
  const posts = await response.json();
  const published = posts.filter((post) => post.status === "publish");
  if (published.length !== 30) {
    throw new Error(`Expected 30 WordPress posts, received ${published.length}`);
  }
  return published;
}

export function featuredImageUrl(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
}
```

- [ ] **Step 5: microCMSクライアントを実装する**

```js
// scripts/lib/microcms-migration-client.mjs
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

export function createMicroCmsMigrationClient({ serviceDomain, apiKey, fetchImpl = fetch }) {
  if (!serviceDomain || !apiKey) throw new Error("microCMS credentials are required");
  const headers = { "X-MICROCMS-API-KEY": apiKey };

  async function listNews() {
    const response = await fetchImpl(`https://${serviceDomain}.microcms.io/api/v1/news?limit=100`, { headers });
    return readJson(response, "list news");
  }

  async function uploadMedia({ bytes, fileName, contentType }) {
    if (bytes.byteLength > MAX_MEDIA_BYTES) throw new Error(`${fileName} exceeds microCMS 5MB limit`);
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: contentType }), fileName);
    const response = await fetchImpl(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
      method: "POST",
      headers,
      body: form,
    });
    return readJson(response, `upload ${fileName}`);
  }

  async function listManagedNews() {
    const response = await fetchImpl(`https://${serviceDomain}.microcms-management.io/api/v1/contents/news?limit=100`, { headers });
    return readJson(response, "list managed news");
  }

  async function getDraft(contentId, draftKey) {
    const response = await fetchImpl(`https://${serviceDomain}.microcms.io/api/v1/news/${contentId}?draftKey=${encodeURIComponent(draftKey)}`, { headers });
    return readJson(response, `get draft ${contentId}`);
  }

  async function putDraft(contentId, payload) {
    const response = await fetchImpl(`https://${serviceDomain}.microcms.io/api/v1/news/${contentId}?status=draft`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readJson(response, `create draft ${contentId}`);
  }

  return { listNews, listManagedNews, getDraft, uploadMedia, putDraft };
}

async function readJson(response, operation) {
  const text = await response.text();
  if (!response.ok) throw new Error(`${operation} failed with HTTP ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
```

- [ ] **Step 6: APIクライアントテストを通す**

Run: `node --test tests/scripts/wordpress-news-source.test.mjs tests/scripts/microcms-migration-client.test.mjs`

Expected: 5 tests PASS.

- [ ] **Step 7: APIクライアントをコミットする**

```bash
git add scripts/lib/wordpress-news-source.mjs scripts/lib/microcms-migration-client.mjs tests/scripts/wordpress-news-source.test.mjs tests/scripts/microcms-migration-client.test.mjs
git commit -m "Add WordPress and microCMS migration clients"
```

---

### Task 3: 再実行可能な移行オーケストレーターとCLI

**Files:**
- Create: `scripts/lib/wordpress-news-migration.mjs`
- Create: `scripts/migrate-wordpress-news.mjs`
- Create: `tests/scripts/wordpress-news-migration.test.mjs`
- Create: `scripts/data/wordpress-news-migration.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1の変換関数、Task 2のAPIクライアント、既存マニフェスト
- Produces: `createMigrationPlan(args)`, `runMigration(args)`, CLIコマンド`npm run cms:migrate-wordpress-news`

- [ ] **Step 1: 重複3件、27件作成、再実行を固定する失敗テストを書く**

```js
// tests/scripts/wordpress-news-migration.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { createMigrationPlan, runMigration } from "../../scripts/lib/wordpress-news-migration.mjs";

const duplicateMap = new Map([
  [2274, "soukai-202604"],
  [2271, "kouryu-202604"],
  [2257, "iso27001-isms-20260306"],
]);

function posts30() {
  return Array.from({ length: 30 }, (_, index) => ({
    id: index === 0 ? 2274 : index === 1 ? 2271 : index === 2 ? 2257 : 3000 + index,
    status: "publish",
    date: "2025-01-01T00:00:00",
    link: `https://jqit.co.jp/old/${index}/`,
    title: { rendered: `記事${index}` },
    content: { rendered: "<p>本文</p>" },
    _embedded: {},
  }));
}

test("createMigrationPlan skips 3 duplicates and plans 27 drafts", () => {
  const plan = createMigrationPlan({ posts: posts30(), duplicateMap, existingIds: new Set(["site-renewal-2026"]) });
  assert.equal(plan.filter((item) => item.action === "skip-duplicate").length, 3);
  assert.equal(plan.filter((item) => item.action === "create-draft").length, 27);
});

test("runMigration dry-run performs no upload or PUT", async () => {
  let mutations = 0;
  const summary = await runMigration({
    posts: posts30(),
    duplicateMap,
    apply: false,
    existingNews: { contents: [{ id: "site-renewal-2026", category: { id: "notice", name: "お知らせ" } }, { id: "soukai-202604", category: { id: "event", name: "イベント" } }] },
    client: { uploadMedia: async () => { mutations += 1; }, putDraft: async () => { mutations += 1; } },
    fetchImpl: async () => { throw new Error("image fetch must not run in dry-run"); },
    manifest: { version: 1, images: {}, posts: {} },
    saveManifest: async () => { throw new Error("dry-run must not save manifest"); },
  });
  assert.equal(mutations, 0);
  assert.deepEqual(summary, { source: 30, duplicates: 3, planned: 27, created: 0, failed: 0 });
});

test("runMigration apply creates 27 drafts and records all 30 mappings", async () => {
  const putIds = [];
  const manifest = { version: 1, images: {}, posts: {} };
  const summary = await runMigration({
    posts: posts30(),
    duplicateMap,
    apply: true,
    existingNews: { contents: [{ id: "site-renewal-2026", category: { id: "notice", name: "お知らせ" } }, { id: "soukai-202604", category: { id: "event", name: "イベント" } }] },
    client: {
      uploadMedia: async () => { throw new Error("posts30 has no images"); },
      putDraft: async (id) => { putIds.push(id); return { id }; },
    },
    fetchImpl: async () => { throw new Error("posts30 has no images"); },
    manifest,
    saveManifest: async () => {},
  });
  assert.equal(putIds.length, 27);
  assert.equal(summary.created, 27);
  assert.equal(summary.failed, 0);
  assert.equal(Object.keys(manifest.posts).length, 30);
});
```

- [ ] **Step 2: テストがモジュール未作成で失敗することを確認する**

Run: `node --test tests/scripts/wordpress-news-migration.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `wordpress-news-migration.mjs`.

- [ ] **Step 3: 移行計画と逐次実行を実装する**

Create `scripts/lib/wordpress-news-migration.mjs`:

```js
import { basename, extname } from "node:path";
import {
  buildDraftPayload,
  classifyCategory,
  contentIdFor,
  extractImageUrls,
  rewriteAndSanitizeContent,
} from "./wordpress-news-transform.mjs";
import { featuredImageUrl } from "./wordpress-news-source.mjs";

export const DUPLICATE_MAP = new Map([
  [2274, "soukai-202604"],
  [2271, "kouryu-202604"],
  [2257, "iso27001-isms-20260306"],
]);

export function createMigrationPlan({ posts, duplicateMap = DUPLICATE_MAP, existingIds }) {
  return posts.map((post) => {
    const duplicateId = duplicateMap.get(post.id);
    if (duplicateId) return { post, contentId: duplicateId, action: "skip-duplicate" };
    const contentId = contentIdFor(post);
    return { post, contentId, action: existingIds.has(contentId) ? "skip-existing" : "create-draft" };
  });
}

export async function runMigration({
  posts,
  duplicateMap = DUPLICATE_MAP,
  apply,
  existingNews,
  client,
  fetchImpl = fetch,
  manifest,
  saveManifest,
}) {
  const existingIds = new Set([
    ...existingNews.contents.map((item) => item.id),
    ...Object.values(manifest.posts).map((item) => item.contentId).filter(Boolean),
  ]);
  const categoryIds = new Map();
  for (const item of existingNews.contents) {
    if (item.category?.name && item.category?.id) categoryIds.set(item.category.name, item.category.id);
  }
  for (const required of ["お知らせ", "イベント"]) {
    if (!categoryIds.has(required)) throw new Error(`microCMS category reference not found: ${required}`);
  }

  const plan = createMigrationPlan({ posts, duplicateMap, existingIds });
  const duplicates = plan.filter((item) => item.action === "skip-duplicate").length;
  const planned = plan.filter((item) => item.action === "create-draft").length;
  const summary = { source: posts.length, duplicates, planned, created: 0, failed: 0 };
  if (!apply) return summary;

  const failures = [];
  for (const item of plan) {
    const wpId = String(item.post.id);
    if (item.action === "skip-duplicate") {
      manifest.posts[wpId] = {
        oldUrl: item.post.link,
        contentId: item.contentId,
        sourceDate: item.post.date.slice(0, 10),
        status: "existing-preserved",
      };
      await saveManifest(manifest);
      continue;
    }
    if (item.action === "skip-existing") continue;

    try {
      const featuredUrl = featuredImageUrl(item.post);
      const sourceImages = [...new Set([
        featuredUrl,
        ...extractImageUrls(item.post.content.rendered),
      ].filter(Boolean))];
      const imageMap = new Map();

      for (const [index, sourceUrl] of sourceImages.entries()) {
        let targetUrl = manifest.images[sourceUrl];
        if (!targetUrl) {
          const image = await downloadImage({
            sourceUrl,
            postId: item.post.id,
            index,
            fetchImpl,
          });
          const uploaded = await client.uploadMedia(image);
          targetUrl = uploaded.url;
          manifest.images[sourceUrl] = targetUrl;
          await saveManifest(manifest);
        }
        imageMap.set(sourceUrl, targetUrl);
      }

      const content = rewriteAndSanitizeContent({
        html: item.post.content.rendered,
        featuredUrl,
        imageMap,
      });
      if (!content) throw new Error("Transformed content is empty");
      const categoryName = classifyCategory(item.post.title.rendered);
      const payload = buildDraftPayload({
        post: item.post,
        categoryId: categoryIds.get(categoryName),
        content,
      });

      await client.putDraft(item.contentId, payload);
      manifest.posts[wpId] = {
        oldUrl: item.post.link,
        contentId: item.contentId,
        sourceDate: item.post.date.slice(0, 10),
        status: "draft-created",
      };
      summary.created += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      manifest.posts[wpId] = {
        oldUrl: item.post.link,
        contentId: item.contentId,
        sourceDate: item.post.date.slice(0, 10),
        status: "failed",
        error: message.slice(0, 300),
      };
      summary.failed += 1;
      failures.push({ contentId: item.contentId, error: message.slice(0, 300) });
    }
    await saveManifest(manifest);
  }

  if (failures.length) summary.failures = failures;
  return summary;
}

async function downloadImage({ sourceUrl, postId, index, fetchImpl }) {
  const response = await fetchImpl(sourceUrl);
  if (!response.ok) throw new Error(`Image download failed with HTTP ${response.status}: ${sourceUrl}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  const urlName = basename(new URL(sourceUrl).pathname);
  const extension = extname(urlName) || extensionFor(contentType);
  const stem = urlName.slice(0, urlName.length - extname(urlName).length) || `image-${index + 1}`;
  const fileName = `wp-${postId}-${index + 1}-${safeFileStem(stem)}${extension}`;
  return { bytes, fileName, contentType };
}

function safeFileStem(value) {
  return decodeURIComponent(value)
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";
}

function extensionFor(contentType) {
  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "image/png") return ".png";
  if (contentType === "image/webp") return ".webp";
  if (contentType === "image/gif") return ".gif";
  throw new Error(`Unsupported image content type: ${contentType}`);
}
```

- [ ] **Step 4: CLIと初期マニフェストを実装する**

Create `scripts/data/wordpress-news-migration.json`:

```json
{
  "version": 1,
  "images": {},
  "posts": {}
}
```

Create `scripts/migrate-wordpress-news.mjs`:

```js
import { existsSync, readFileSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createMicroCmsMigrationClient } from "./lib/microcms-migration-client.mjs";
import { runMigration } from "./lib/wordpress-news-migration.mjs";
import { fetchWordPressPosts } from "./lib/wordpress-news-source.mjs";

const root = resolve(import.meta.dirname, "..");
loadEnv(resolve(root, ".env.local"));

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--apply");
if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(", ")}`);
const apply = args.includes("--apply");

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const client = createMicroCmsMigrationClient({ serviceDomain, apiKey });
const manifestPath = resolve(root, "scripts/data/wordpress-news-migration.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const posts = await fetchWordPressPosts();
const existingNews = await client.listNews();

const summary = await runMigration({
  posts,
  apply,
  existingNews,
  client,
  manifest,
  saveManifest: (next) => saveManifestAtomically(manifestPath, next),
});

for (const key of ["source", "duplicates", "planned", "created", "failed"]) {
  console.log(`${key}=${summary[key]}`);
}
console.log(`mode=${apply ? "apply" : "dry-run"}`);
for (const failure of summary.failures ?? []) {
  console.error(`failed contentId=${failure.contentId}: ${failure.error}`);
}
if (summary.failed > 0) process.exitCode = 1;

async function saveManifestAtomically(path, value) {
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryPath, path);
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2").replace(/\\n/g, "\n");
  }
}
```

Add package scripts:

```json
{
  "scripts": {
    "test": "node --test tests/**/*.test.mjs",
    "cms:migrate-wordpress-news": "node scripts/migrate-wordpress-news.mjs"
  }
}
```

Keep all existing scripts unchanged.

- [ ] **Step 5: オーケストレーターテストを通す**

Run: `npm test`

Expected: all transform, source, client, and migration tests PASS.

- [ ] **Step 6: dry-runで実データ件数を検証する**

Run: `npm run cms:migrate-wordpress-news`

Expected output contains exactly:

```text
source=30
duplicates=3
planned=27
created=0
failed=0
mode=dry-run
```

Expected: `git diff -- scripts/data/wordpress-news-migration.json` is empty.

- [ ] **Step 7: オーケストレーターとCLIをコミットする**

```bash
git add package.json scripts/lib/wordpress-news-migration.mjs scripts/migrate-wordpress-news.mjs scripts/data/wordpress-news-migration.json tests/scripts/wordpress-news-migration.test.mjs
git commit -m "Add repeatable WordPress news migration"
```

---

### Task 4: microCMS下書き投入と完全性検証

**Files:**
- Modify: `scripts/data/wordpress-news-migration.json`
- Create: `scripts/verify-wordpress-news-migration.mjs`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: `npm run cms:migrate-wordpress-news -- --apply`、microCMS API権限、Task 3のマニフェスト
- Produces: microCMS下書き27件、画像URL対応、旧URL→新ID対応

- [ ] **Step 1: microCMS APIキー権限を管理画面で確認する**

Required permissions:

```text
Content API: GET, PUT for endpoint news
Management API: Media Upload, Retrieve Content (List/Detail)
```

Expected: the key in `.env.local` has all three permissions. Do not paste the key into notes or terminal output.

- [ ] **Step 2: apply前に既存4件のフィンガープリントを保存する**

Run:

```bash
node --env-file=.env.local - <<'NODE' > /tmp/microcms-news-before.json
import { createHash } from "node:crypto";
const d = process.env.MICROCMS_SERVICE_DOMAIN;
const k = process.env.MICROCMS_API_KEY;
const response = await fetch(`https://${d}.microcms.io/api/v1/news?limit=100`, {
  headers: { "X-MICROCMS-API-KEY": k },
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
const expected = new Set([
  "iso27001-isms-20260306",
  "kouryu-202604",
  "site-renewal-2026",
  "soukai-202604",
]);
const snapshot = data.contents
  .filter((item) => expected.has(item.id))
  .map((item) => ({
    id: item.id,
    title: item.title,
    publishedAt: item.publishedAt,
    bodySha256: createHash("sha256").update(item.content ?? item.body ?? "").digest("hex"),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));
console.log(JSON.stringify(snapshot, null, 2));
NODE
```

Expected IDs:

```text
iso27001-isms-20260306
kouryu-202604
site-renewal-2026
soukai-202604
```

- [ ] **Step 3: 27件を下書きとして投入する**

Run: `npm run cms:migrate-wordpress-news -- --apply`

Expected output:

```text
source=30
duplicates=3
planned=27
created=27
failed=0
mode=apply
```

Expected: no content is publicly added because every PUT request includes `status=draft`.

- [ ] **Step 4: マニフェスト完全性を機械検証する**

Run:

```bash
node - <<'NODE'
import assert from "node:assert/strict";
import fs from "node:fs";
const manifest = JSON.parse(fs.readFileSync("scripts/data/wordpress-news-migration.json", "utf8"));
assert.equal(Object.keys(manifest.posts).length, 30);
assert.equal(Object.values(manifest.posts).filter((post) => post.status === "draft-created").length, 27);
assert.equal(Object.values(manifest.posts).filter((post) => post.status === "existing-preserved").length, 3);
assert.equal(Object.values(manifest.images).every((url) => url.startsWith("https://images.microcms-assets.io/")), true);
console.log("manifest verification passed");
NODE
```

Expected: `manifest verification passed`.

- [ ] **Step 5: 下書き本文と画像をManagement APIで検証する**

Create `scripts/verify-wordpress-news-migration.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import { createMicroCmsMigrationClient } from "./lib/microcms-migration-client.mjs";
import { extractImageUrls } from "./lib/wordpress-news-transform.mjs";

const manifest = JSON.parse(fs.readFileSync("scripts/data/wordpress-news-migration.json", "utf8"));
const drafts = Object.values(manifest.posts).filter((post) => post.status === "draft-created");
assert.equal(drafts.length, 27);

const client = createMicroCmsMigrationClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const managed = await client.listManagedNews();
const metadataById = new Map(managed.contents.map((item) => [item.id, item]));

let imageCount = 0;
for (const expected of drafts) {
  const metadata = metadataById.get(expected.contentId);
  assert.ok(metadata, `Missing managed content: ${expected.contentId}`);
  assert.ok(metadata.status.includes("DRAFT"), `Not draft: ${expected.contentId}`);
  assert.ok(metadata.draftKey, `Missing draftKey: ${expected.contentId}`);
  const content = await client.getDraft(expected.contentId, metadata.draftKey);
  assert.ok(content.title?.trim(), `Empty title: ${expected.contentId}`);
  assert.ok(content.content?.trim(), `Empty content: ${expected.contentId}`);
  assert.equal(content.publishedAt.slice(0, 10), expected.sourceDate);
  assert.doesNotMatch(content.content, /jqit\.co\.jp\/hp\/wp-content\/uploads/i);

  for (const url of extractImageUrls(content.content)) {
    assert.match(url, /^https:\/\/images\.microcms-assets\.io\//);
    const response = await fetch(url);
    assert.ok(response.ok, `Broken image ${response.status}: ${url}`);
    imageCount += 1;
  }
}

console.log(`verified drafts=${drafts.length} images=${imageCount}`);
```

Add package script:

```json
{
  "scripts": {
    "cms:verify-wordpress-news": "node --env-file=.env.local scripts/verify-wordpress-news-migration.mjs"
  }
}
```

Run: `npm run cms:verify-wordpress-news`

Expected: output begins with `verified drafts=27` and exits 0.

- [ ] **Step 6: 既存4件が変更されていないことを確認する**

Run:

```bash
node --env-file=.env.local - <<'NODE' > /tmp/microcms-news-after.json
import { createHash } from "node:crypto";
const d = process.env.MICROCMS_SERVICE_DOMAIN;
const k = process.env.MICROCMS_API_KEY;
const response = await fetch(`https://${d}.microcms.io/api/v1/news?limit=100`, {
  headers: { "X-MICROCMS-API-KEY": k },
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
const expected = new Set([
  "iso27001-isms-20260306",
  "kouryu-202604",
  "site-renewal-2026",
  "soukai-202604",
]);
const snapshot = data.contents
  .filter((item) => expected.has(item.id))
  .map((item) => ({
    id: item.id,
    title: item.title,
    publishedAt: item.publishedAt,
    bodySha256: createHash("sha256").update(item.content ?? item.body ?? "").digest("hex"),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));
console.log(JSON.stringify(snapshot, null, 2));
NODE
diff -u /tmp/microcms-news-before.json /tmp/microcms-news-after.json
```

Expected: no output and exit code 0.

- [ ] **Step 7: READMEへ運用手順を追記する**

Add this section after the current microCMS schema section:

````markdown
### 旧WordPress記事の移行

dry-run（外部データを変更しません）:

```bash
npm run cms:migrate-wordpress-news
```

下書き投入:

```bash
npm run cms:migrate-wordpress-news -- --apply
```

移行スクリプトはWordPress公開投稿30件を取得し、既存の重複3件を維持したまま残り27件をmicroCMSへ下書き登録します。本文画像はmicroCMSメディアへ移し、進捗と旧URL対応を`scripts/data/wordpress-news-migration.json`へ保存します。実行にはmicroCMS Content APIのGET/PUT権限とManagement APIのMedia Upload・Retrieve Content権限が必要です。
````

- [ ] **Step 8: 最終検証を実行する**

Run:

```bash
npm test
npm run lint
npm run build
npm run cms:migrate-wordpress-news
```

Expected:

```text
all tests PASS
eslint exits 0
Next.js build succeeds
dry-run reports source=30, duplicates=3, planned=0 or skip-existing=27 after apply, failed=0
```

- [ ] **Step 9: マニフェストと運用手順をコミットする**

```bash
git add scripts/data/wordpress-news-migration.json scripts/verify-wordpress-news-migration.mjs package.json README.md
git commit -m "Record migrated WordPress news drafts"
```

---

## Self-Review Results

- Spec coverage: 30件取得、3件維持、27件下書き、画像移行、公開日維持、再実行性、旧URL対応、既存4件不変を各タスクでカバーしている。
- Placeholder scan: 実装タスクに未定義の後回し項目はない。Task 3の`runMigration`は9段階の必須アルゴリズムと戻り値を固定している。
- Type consistency: `contentIdFor`, `classifyCategory`, `extractImageUrls`, `rewriteAndSanitizeContent`, `buildDraftPayload`, `fetchWordPressPosts`, `featuredImageUrl`, `createMicroCmsMigrationClient`, `createMigrationPlan`, `runMigration`の名前と入出力は全タスクで一致している。
