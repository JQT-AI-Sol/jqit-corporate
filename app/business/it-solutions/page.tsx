import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: "ITソリューション事業",
  description:
    "株式会社JQITのITソリューション事業。受託開発（SI）とSESにより、システム＆アプリ開発・インフラ・QA（第三者検証）をワンストップで提供します。",
};

const strengths = [
  {
    title: "教育体制",
    body: "IT人材の不足が進んでいる市場状況下でも、充実した社員教育と開発経験により、迅速に開発体制を整えることが可能です。それによりお客様へ安定かつ高い品質のサービスを提供し続けています。",
  },
  {
    title: "専門特化",
    body: "システムエンジニアやプログラマーはもちろん、ネットワーク・インフラエンジニアや検証業務に豊富な知識を持つテストエンジニアなど、各専門分野に特化した高い技術力・生産性の体制を構築し、お客様へ安定かつ高い品質のサービスを提供します。",
  },
];

const fields = [
  {
    no: "01",
    title: "システム＆アプリ開発",
    body: "Web系、スマホアプリ、社内システム系などのソフトウェアを要件定義・設計・コーディング・テスト・保守運用まで行います。フロントエンドやサーバサイドのプログラマーはもちろん、システムエンジニアも多数在籍しています。",
  },
  {
    no: "02",
    title: "インフラ（サーバ / ネットワーク）",
    body: "要件定義からシステムの規模や環境に合わせて、ネットワーク・サーバ・ミドルウェアの導入や企画、設計から運用保守、監視業務まで、ITインフラにかかわる業務を幅広く担います。",
  },
  {
    no: "03",
    title: "QA（第三者検証）",
    body: "開発者や運用者とは異なる第三者が、設計通りに正しく動作するかをテストし、システムの品質を評価します。不具合やユーザー観点の問題箇所を効率的かつ網羅的に見つけ出し、テスト・評価を繰り返すことでより高品質なシステムを作り上げます。",
  },
];

export default function ItSolutionsPage() {
  return (
    <>
      <PageHeader title="ITソリューション事業" en="IT Solutions" />

      {/* INTRO */}
      <section className="bg-paper py-20 min-[720px]:py-[92px]">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 min-[1024px]:grid-cols-[1.05fr_0.95fr] min-[1024px]:gap-16">
            <FadeIn>
              <Kicker className="mb-5">System Integration</Kicker>
              <h2 className="palt text-[26px] font-bold leading-[1.5] tracking-[-0.02em] text-ink min-[720px]:text-[32px]">
                要件定義から運用保守まで、
                <br />
                <span className="text-brand">一気通貫</span>で担う。
              </h2>
              <p className="mt-6 text-[15px] leading-[2.1] text-body">
                システム構築の要件定義から運用保守までを行う事業です。WebアプリケーションやWeb
                APIなどをメインとした業務系システムの開発を行っています。設計・開発・構築・検証・導入・保守・運用などを一括、または一部からでもお請けします。
              </p>
            </FadeIn>
            <FadeIn>
              <Image
                src="/business-it.png"
                alt="コードを書くエンジニアの手元"
                width={2400}
                height={1792}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="h-auto w-full rounded-xl object-cover"
              />
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* STRENGTHS */}
      <section className="border-t border-line bg-cream py-20 min-[720px]:py-[88px]">
        <Container>
          <SectionHead kicker="Our Strengths" title="当社の強み" className="mb-11" />
          <FadeIn className="grid grid-cols-1 gap-px border border-line bg-line min-[900px]:grid-cols-2">
            {strengths.map((s) => (
              <div key={s.title} className="bg-white px-8 py-9">
                <h3 className="palt text-[19px] font-bold leading-[1.6] text-ink">
                  {s.title}
                </h3>
                <p className="mt-3.5 text-[14px] leading-[2.05] text-body">{s.body}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </section>

      {/* SES */}
      <section className="bg-paper py-20 min-[720px]:py-[92px]">
        <Container>
          <SectionHead
            kicker="System Engineering Service"
            title={
              <>
                SES — 技術を、<span className="text-brand">現場</span>へ。
              </>
            }
            className="mb-10"
          />
          <FadeIn className="max-w-[860px] border-l-2 border-brand pl-6 min-[720px]:pl-8">
            <p className="text-[15px] leading-[2.1] text-body">
              システムエンジニアの技術をお客様に提供するサービスです。エンジニアがお客様先に常駐し、システム開発・保守・運用の支援を行います。常駐により必要な打ち合わせを迅速に行い、スピード感のあるプロジェクトを実現できます。
            </p>
            <p className="mt-5 text-[15px] leading-[2.1] text-body">
              業務の拡大や縮小に合わせて、専門的な技術者を必要な期間ご提供いたしますので、雇用の問題が解消され、柔軟なプロジェクト運用体制の構築が可能となります。
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* FIELDS */}
      <section className="border-t border-line bg-cream py-20 min-[720px]:py-[88px]">
        <Container>
          <SectionHead kicker="Service" title="サービス領域" className="mb-11" />
          <FadeIn className="grid grid-cols-1 gap-px border border-line bg-line min-[900px]:grid-cols-3">
            {fields.map((f) => (
              <div key={f.no} className="bg-white px-7 py-8">
                <p className="mb-3.5 font-mono text-[13px] font-semibold text-brand">
                  {f.no}
                </p>
                <h3 className="palt text-[17px] font-bold leading-[1.6] text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.95] text-muted">{f.body}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-paper py-16 min-[720px]:py-20">
        <Container className="text-center">
          <FadeIn>
            <h2 className="palt text-[26px] font-bold tracking-[-0.02em] text-ink min-[720px]:text-[34px]">
              開発体制のご相談、お気軽に。
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact">お問い合わせ</Button>
              <Button href="/business/ai-solutions" variant="outline">
                AIソリューション事業を見る
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
