import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { companySubNav, SubNav } from "@/components/layout/SubNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { SectionHead } from "@/components/ui/SectionHead";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "会社情報",
  description:
    "株式会社JQITの会社情報。企業理念「挑戦と革新で、顧客の未来を切り拓く。」のもと、ITソリューション事業とAIソリューション事業を展開しています。",
};

const philosophy = [
  {
    en: "Purpose",
    title: "成長機会の最大化と社会への貢献",
    body: "デジタル技術を通じて、お客様と社会に新しい価値を生み、持続可能な未来に貢献します。",
  },
  {
    en: "Mission",
    title: "課題の“本質”を捉える伴走者",
    body: "表面的な要望の先にある本質的な課題に向き合い、お客様と共に解決まで走り切ります。",
  },
  {
    en: "Vision",
    title: "“プロ”としての自律性とオーナーシップ",
    body: "一人ひとりがプロフェッショナルとして自律的に考え、仕事に責任と誇りを持ちます。",
  },
];

const values = [
  "顧客中心",
  "デジタル化社会への貢献",
  "技術探求と挑戦",
  "学びと自己実現",
  "利他の精神",
  "人的資本を育てる文化",
];

const profile = [
  { k: "会社名", v: `${siteConfig.name}（${siteConfig.nameEn}）` },
  { k: "設立", v: "2024年12月6日" },
  { k: "代表者", v: `代表取締役社長　${siteConfig.ceo}` },
  { k: "資本金", v: siteConfig.capital },
  { k: "所在地", v: siteConfig.address },
  { k: "TEL / FAX", v: `TEL ${siteConfig.tel}　FAX ${siteConfig.fax}` },
  {
    k: "事業内容",
    v: "ITソリューション事業（受託開発／SES／インフラ／QA・第三者検証）、AIソリューション事業（生成AI導入支援／AIエージェント開発／AI人材育成）",
  },
  { k: "従業員数", v: siteConfig.employees },
  {
    k: "許認可・認証",
    v: "労働者派遣事業 派13-318536／ISO/IEC 27001（ISMS）／DX認定",
  },
  {
    k: "参画・加入団体",
    v: "2026年度 財界 BEST AI 100／ISTQB® Gold パートナー",
  },
  { k: "取引先銀行", v: "三井住友銀行、GMOあおぞらネット銀行" },
  { k: "営業時間", v: siteConfig.businessHours },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="会社情報" en="About" />
      <SubNav group="Company" items={companySubNav} />

      {/* MESSAGE — 代表写真の実素材が入るまでは、写真は「雰囲気を示す全幅バンド」として
          メッセージから切り離す（無人写真がメッセージの人物代替に見える誤読を避ける） */}
      <section id="message" className="bg-paper">
        <div className="relative overflow-hidden">
          <Image
            src="/office-about.png"
            alt="JQITオフィスのミーティングスペース"
            width={928}
            height={1152}
            sizes="100vw"
            className="h-[220px] w-full object-cover object-[center_60%] min-[720px]:h-[300px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/25 via-ink/5 to-ink/10"
          />
        </div>
        <Container>
          <FadeIn className="mx-auto max-w-[820px] py-16 min-[720px]:py-[84px]">
            <Kicker className="mb-5">Message</Kicker>
            <h2 className="palt text-[28px] font-bold leading-[1.5] tracking-[-0.02em] text-ink min-[720px]:text-[36px]">
              挑戦と革新で、顧客の<span className="text-brand">未来</span>
              を切り拓く。
            </h2>
            <div className="mt-9 border-l-2 border-brand pl-6 min-[720px]:pl-8">
              <p className="text-[17px] leading-[2.1] text-body min-[720px]:text-[19px] min-[720px]:leading-[1.95]">
                私たちJQITは、技術の力でお客様の“本質的な課題”を解決するITのプロフェッショナル集団です。表面的な要望に応えるだけでなく、その先にある課題の本質を捉え、解決まで伴走する。システム開発からAI活用まで、変化を恐れず挑戦と革新を続けることで、お客様と社会の未来を切り拓いてまいります。
              </p>
            </div>
            <p className="mt-9 flex items-baseline gap-3.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                代表取締役社長
              </span>
              <span className="palt text-xl font-bold text-ink">{siteConfig.ceo}</span>
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* PHILOSOPHY & VALUES */}
      <section className="border-t border-line bg-cream py-20 min-[720px]:py-[88px]">
        <Container>
          <SectionHead
            kicker="Philosophy"
            title={
              <>
                私たちが大切にする<span className="text-brand">価値観</span>
              </>
            }
            className="mb-11"
          />
          <FadeIn className="grid grid-cols-1 gap-px border border-line bg-line min-[900px]:grid-cols-3">
            {philosophy.map((p) => (
              <div key={p.en} className="bg-white px-8 py-9">
                <p className="mb-4 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-brand">
                  {p.en}
                </p>
                <h3 className="palt text-[20px] font-bold leading-[1.5] text-ink">
                  {p.title}
                </h3>
                <p className="mt-3.5 text-sm leading-[1.95] text-muted">{p.body}</p>
              </div>
            ))}
          </FadeIn>
          <FadeIn className="mt-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              6 Values — 行動指針
            </p>
            <div className="grid grid-cols-1 gap-px border border-line bg-line min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
              {values.map((v, i) => (
                <div key={v} className="flex items-baseline gap-4 bg-white px-6 py-5">
                  <span className="font-mono text-[12px] font-semibold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="palt text-[15px] font-bold text-ink">{v}</span>
                </div>
              ))}
            </div>
            <Link
              href="/corporate-vision"
              className="group mt-8 inline-flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[0.12em] text-ink transition-colors hover:text-brand"
            >
              ビジョンと戦略を詳しく見る
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

      {/* COMPANY PROFILE */}
      <section className="bg-paper py-20 min-[720px]:py-[92px]">
        <Container>
          <SectionHead kicker="Company Profile" title="会社概要" className="mb-10" />
          <FadeIn className="border-t border-ink">
            {profile.map((row) => (
              <div
                key={row.k}
                className="grid grid-cols-1 items-baseline gap-2 border-b border-line px-2 py-5 min-[720px]:grid-cols-[200px_1fr] min-[720px]:gap-6 min-[720px]:py-[22px]"
              >
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted">{row.k}</p>
                <p className="text-[15px] leading-[1.9] text-ink">{row.v}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line bg-cream py-16 min-[720px]:py-20">
        <Container className="relative text-center">
          <FadeIn>
            <h2 className="palt text-[26px] font-bold tracking-[-0.02em] text-ink min-[720px]:text-[34px]">
              JQITについて、もっと知る。
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href={siteConfig.links.recruit} external>
                採用情報を見る
              </Button>
              <Button href="/contact" variant="outline">
                お問い合わせ
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
