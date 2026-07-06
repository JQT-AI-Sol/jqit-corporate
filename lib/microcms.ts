import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import sanitizeHtml from "sanitize-html";

/**
 * ニュース記事。microCMS 側のAPIスキーマ（エンドポイント: news）:
 * - title: テキストフィールド
 * - date: 日時
 * - category: セレクトフィールド（お知らせ / プレス / 採用 / イベント）
 * - eyecatch: 画像（一覧・詳細上部に表示）
 * - gallery: 複数画像（イベント写真などに表示）
 * - body: リッチエディタ（microCMS初期テンプレートの content も本文として扱う）
 */
export type NewsCategory = "お知らせ" | "プレス" | "採用" | "イベント";

export type MicroCMSImage = {
  url: string;
  width?: number;
  height?: number;
};

type MicroCMSCategory =
  | string
  | string[]
  | {
      name?: string;
      id?: string;
    };

export type News = {
  id: string;
  title: string;
  date: string;
  category: NewsCategory | string;
  eyecatch?: MicroCMSImage;
  gallery?: MicroCMSImage[];
  body?: string;
};

type MicroCMSNews = {
  id: string;
  title: string;
  date?: string;
  publishedAt?: string;
  category?: MicroCMSCategory;
  eyecatch?: MicroCMSImage;
  gallery?: MicroCMSImage[];
  body?: string;
  content?: string;
};

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

const client =
  serviceDomain && apiKey ? createClient({ serviceDomain, apiKey }) : null;

/** microCMS が接続済みかどうか（未接続時はフォールバックデータで動作） */
export const isCmsConfigured = client !== null;

function isNotFoundError(e: unknown): boolean {
  return e instanceof Error && /\b404\b/.test(e.message);
}

/** リッチエディタ由来のHTMLをサーバー側でサニタイズ（CMSアカウント侵害時の多層防御） */
function sanitizeBody(html: string | undefined): string | undefined {
  if (!html) return html;
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      // target="_blank" には rel を強制付与（tabnabbing対策）
      a: (tagName, attribs) =>
        attribs.target === "_blank"
          ? { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }
          : { tagName, attribs },
    },
  });
}

function normalize(item: MicroCMSNews): News {
  const category = Array.isArray(item.category)
    ? (item.category[0] ?? "お知らせ")
    : typeof item.category === "object" && item.category !== null
      ? (item.category.name ?? "お知らせ")
      : (item.category ?? "お知らせ");

  return {
    id: item.id,
    title: item.title,
    // 日時フィールドは ISO 文字列で返るため日付部分のみ使う
    date: (item.date ?? item.publishedAt)?.slice(0, 10) ?? "",
    category,
    eyecatch: item.eyecatch,
    gallery: item.gallery?.filter((image) => image.url),
    body: sanitizeBody(item.body ?? item.content),
  };
}

export async function getNewsList(queries?: MicroCMSQueries): Promise<News[]> {
  if (!client) {
    const { fallbackNews } = await import("./news-fallback");
    return fallbackNews.slice(0, queries?.limit ?? fallbackNews.length);
  }
  try {
    const res = await client.getList<MicroCMSNews>({
      endpoint: "news",
      queries: { orders: "-date", ...queries },
    });
    return res.contents.map(normalize);
  } catch (e) {
    if (!isNotFoundError(e)) {
      console.error("[microcms] ニュース一覧の取得に失敗。フォールバックを使用:", e);
    }
    const { fallbackNews } = await import("./news-fallback");
    return fallbackNews.slice(0, queries?.limit ?? fallbackNews.length);
  }
}

export async function getNewsDetail(id: string): Promise<News | null> {
  if (!client) {
    const { fallbackNews } = await import("./news-fallback");
    return fallbackNews.find((n) => n.id === id) ?? null;
  }
  try {
    const item = await client.getListDetail<MicroCMSNews>({
      endpoint: "news",
      contentId: id,
    });
    return normalize(item);
  } catch (e) {
    // 404（未公開・削除済み）は正常系なのでログしない
    // 注: microcms-js-sdk はステータスを構造化して公開しないため、
    // "status: 404" のメッセージ形式（SDK v3系）を単語境界付きで判定する
    if (!isNotFoundError(e)) {
      console.error(`[microcms] ニュース詳細(${id})の取得に失敗:`, e);
    }
    const { fallbackNews } = await import("./news-fallback");
    return fallbackNews.find((n) => n.id === id) ?? null;
  }
}

export function formatNewsDate(date: string): string {
  return date.replaceAll("-", ".");
}
