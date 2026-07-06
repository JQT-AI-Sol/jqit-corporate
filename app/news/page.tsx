import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsListFiltered } from "@/components/news/NewsListFiltered";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { getNewsList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "ニュース",
  description: "JQIT株式会社のお知らせ・イベント情報の一覧です。",
};

export const revalidate = 60;

export default async function NewsListPage() {
  const news = await getNewsList({ limit: 50 });

  return (
    <>
      <PageHeader title="ニュース" en="News" />
      <section className="bg-paper pb-16 pt-14 min-[720px]:pb-20 min-[720px]:pt-16">
        <Container>
          <FadeIn>
            <NewsListFiltered items={news} />
          </FadeIn>
          {news.length === 0 && (
            <p className="py-16 text-center text-sm text-muted">
              現在、公開中のニュースはありません。
            </p>
          )}
          <FadeIn className="mt-10 flex flex-wrap items-center justify-between gap-5 border border-line bg-cream px-7 py-6">
            <p className="text-sm leading-relaxed text-body">
              ニュース掲載内容に関するお問い合わせはこちらから。
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[0.12em] text-ink transition-colors hover:text-brand"
            >
              お問い合わせ
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
