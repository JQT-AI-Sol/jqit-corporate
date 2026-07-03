import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { formatNewsDate, getNewsDetail, getNewsList } from "@/lib/microcms";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

/** ビルド時に既知の記事を事前生成（未知IDは通常ビルドではISRで都度生成） */
export async function generateStaticParams() {
  const news = await getNewsList({ limit: 100 });
  return news.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsDetail(id);
  if (!news) return { title: "ニュース" };
  return {
    title: news.title,
    description: `${news.category}｜${formatNewsDate(news.date)}｜JQIT株式会社のニュース`,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const news = await getNewsDetail(id);
  if (!news) notFound();

  const related = (await getNewsList({ limit: 4 }))
    .filter((n) => n.id !== news.id)
    .slice(0, 3);
  const shareHref = `https://x.com/intent/post?text=${encodeURIComponent(
    `${news.title}｜${siteConfig.name}`,
  )}&url=${encodeURIComponent(`${siteConfig.url}/news/${news.id}`)}`;

  return (
    <>
      {/* 記事詳細は記事タイトルが主役。汎用PageHeaderは使わずパンくずのみの軽量帯にする */}
      <div className="border-b border-line bg-cream">
        <Container>
          <nav
            aria-label="パンくずリスト"
            className="py-6 font-mono text-[11px] tracking-[0.14em] text-muted"
          >
            <Link href="/" className="transition-colors hover:text-brand">
              HOME
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <Link href="/news" className="transition-colors hover:text-brand">
              NEWS
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span
              aria-current="page"
              className="inline-block max-w-[24em] truncate align-bottom font-sans tracking-normal"
            >
              {news.title}
            </span>
          </nav>
        </Container>
      </div>

      <section className="bg-paper pb-24 pt-12 min-[720px]:pt-14">
        <Container className="max-w-[860px]">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[13px] tracking-[0.06em] text-muted">
              {formatNewsDate(news.date)}
            </span>
            <span className="rounded-card border border-brand px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.06em] text-brand">
              {news.category}
            </span>
          </div>
          <h1 className="palt border-b border-line pb-8 text-[36px] font-bold leading-[1.35] tracking-[-0.02em] text-ink min-[720px]:text-[44px]">
            {news.title}
          </h1>
          {/* 本文は microCMS 管理画面（社内編集者のみ）由来のリッチテキスト */}
          <div
            className="news-body mt-10"
            dangerouslySetInnerHTML={{ __html: news.body ?? "" }}
          />

          <div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-line pt-8">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[0.12em] text-ink transition-colors hover:text-brand"
            >
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-x-1.5"
              >
                ←
              </span>
              ニュース一覧へ戻る
            </Link>
            <a
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[0.12em] text-ink transition-colors hover:text-brand"
            >
              この記事をXでシェア
              <span aria-hidden className="font-mono text-[11px] text-muted">
                ↗
              </span>
            </a>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
                More News
              </p>
              <h2 className="palt mb-6 text-[22px] font-bold tracking-[-0.02em] text-ink">
                その他のニュース
              </h2>
              <div className="border-t border-line">
                {related.map((n) => (
                  <Link
                    key={n.id}
                    href={`/news/${n.id}`}
                    className="grid grid-cols-[auto_auto_1fr] items-center gap-x-4 gap-y-2.5 border-b border-line px-1 py-[18px] transition-colors hover:bg-cream min-[720px]:grid-cols-[120px_104px_1fr_auto] min-[720px]:gap-5"
                  >
                    <span className="font-mono text-[13px] tracking-[0.06em] text-muted">
                      {formatNewsDate(n.date)}
                    </span>
                    <span className="justify-self-start rounded-card border border-brand px-2.5 py-[3px] text-[11px] font-semibold tracking-[0.06em] text-brand">
                      {n.category}
                    </span>
                    <span className="col-span-3 text-[15px] leading-[1.7] text-ink min-[720px]:col-span-1">
                      {n.title}
                    </span>
                    <span
                      aria-hidden
                      className="hidden font-mono text-sm text-[#c9c6c0] min-[720px]:block"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
