import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { SectionHead } from "@/components/ui/SectionHead";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AIソリューション事業",
  description:
    "株式会社JQITのAIソリューション事業。生成AI導入支援・コンサルティング、AI人材育成、AIシステム・アプリケーション開発で企業のAI活用を支援します。",
};

const services = [
  {
    no: "01",
    title: "生成AI導入支援・コンサルティング",
    items: [
      {
        head: "プロンプトエンジニアリング",
        body: "事業内容やご要望に応じて独自プロンプトを制作。豊富なプロンプト開発実績をもとに、AI活用を全面的にサポートします。",
      },
    ],
  },
  {
    no: "02",
    title: "AI人材育成・カリキュラム実施",
    items: [
      {
        head: "独自AIカリキュラムによる研修・セミナー",
        body: "プロンプトからRAG、ハルシネーションやセキュリティ対策まで、生成AIを体系的に熟知した人材の育成を支援します。",
      },
    ],
  },
  {
    no: "03",
    title: "AIシステム・アプリケーション開発",
    items: [
      {
        head: "チャットボット・RAG",
        body: "生成AIを活用するためのシステム開発。独自データや最新情報を学習したRAGシステムを構築します。",
      },
      {
        head: "AIエージェント",
        body: "自律的にタスクを実行するAIエージェントを開発します。",
      },
    ],
  },
];

export default function AiSolutionsPage() {
  return (
    <>
      <PageHeader title="AIソリューション事業" en="AI Solutions" />

      {/* INTRO */}
      <section className="bg-paper py-20 min-[720px]:py-[92px]">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 min-[1024px]:grid-cols-[1.05fr_0.95fr] min-[1024px]:gap-16">
            <FadeIn>
              <Kicker className="mb-5">AI Solutions</Kicker>
              <h2 className="palt text-[26px] font-bold leading-[1.5] tracking-[-0.02em] text-ink min-[720px]:text-[32px]">
                導入支援から人材育成、
                <br />
                開発まで。<span className="text-brand">AI活用</span>を全面支援。
              </h2>
              <p className="mt-6 text-[15px] leading-[2.1] text-body">
                生成AI導入支援・コンサルティング、AI人材育成・カリキュラム実施、AIシステム・アプリケーション開発の3つの領域で、企業のAI活用を支援します。
              </p>
            </FadeIn>
            <FadeIn>
              <Image
                src="/business-ai.png"
                alt="AIダッシュボードを前に議論するメンバー"
                width={2400}
                height={1792}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto w-full rounded-xl object-cover"
              />
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* SERVICES */}
      <section className="border-t border-line bg-cream py-20 min-[720px]:py-[88px]">
        <Container>
          <SectionHead kicker="Service" title="提供サービス" className="mb-11" />
          <div className="space-y-6">
            {services.map((s) => (
              <FadeIn key={s.no} className="border border-line bg-white">
                <div className="flex items-baseline gap-4 border-b border-line px-7 py-5 min-[720px]:px-8">
                  <span className="font-mono text-[13px] font-semibold text-brand">
                    {s.no}
                  </span>
                  <h3 className="palt text-[18px] font-bold leading-[1.5] text-ink min-[720px]:text-[20px]">
                    {s.title}
                  </h3>
                </div>
                <div
                  className={`grid grid-cols-1 gap-px bg-line ${s.items.length > 1 ? "min-[720px]:grid-cols-2" : ""}`}
                >
                  {s.items.map((item) => (
                    <div key={item.head} className="bg-white px-7 py-6 min-[720px]:px-8">
                      <h4 className="palt text-[15px] font-bold text-ink">{item.head}</h4>
                      <p className="mt-2.5 text-[13.5px] leading-[1.95] text-muted">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* NOVA */}
      <section className="overflow-hidden bg-ink py-20 text-white min-[720px]:py-[92px]">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 min-[1024px]:grid-cols-[0.95fr_1.05fr] min-[1024px]:gap-16">
            <FadeIn>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
                Product
              </p>
              <h2 className="palt text-[26px] font-bold leading-[1.5] tracking-[-0.02em] min-[720px]:text-[32px]">
                AIマッチング×一元管理で、
                <br />
                SES営業の生産性を劇的に向上。
              </h2>
              <p className="mt-6 text-[14.5px] leading-[2.05] text-white/80">
                NOVAは、SES事業に特化した管理システムです。生成AIを活用したマッチング機能、社員管理、人材管理、案件管理、契約管理など、SES事業に必要な情報を一元管理。AI機能により、SES営業未経験でも高精度なマッチングを実現できます。
              </p>
              <div className="mt-8">
                <Button href={siteConfig.links.nova} external>
                  NOVA 製品サイトへ
                </Button>
              </div>
            </FadeIn>
            <FadeIn>
              <Image
                src="/nova-product.png"
                alt="NOVAの管理画面"
                width={748}
                height={438}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full rounded-xl border border-white/10 object-cover"
              />
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-paper py-16 min-[720px]:py-20">
        <Container className="text-center">
          <FadeIn>
            <h2 className="palt text-[26px] font-bold tracking-[-0.02em] text-ink min-[720px]:text-[34px]">
              AI活用のご相談、お気軽に。
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact">お問い合わせ</Button>
              <Button href="/business/it-solutions" variant="outline">
                ITソリューション事業を見る
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
