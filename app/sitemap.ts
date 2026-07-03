import type { MetadataRoute } from "next";
import { getNewsList } from "@/lib/microcms";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const news = await getNewsList({ limit: 100 });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/news`, changeFrequency: "daily", priority: 0.9 },
    ...news.map((n) => ({
      url: `${base}/news/${n.id}`,
      lastModified: n.date ? new Date(n.date) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
