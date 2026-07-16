import type { Metadata } from "next";
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
        </Container>
      </section>
    </>
  );
}
