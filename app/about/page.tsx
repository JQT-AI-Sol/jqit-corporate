import type { Metadata } from "next";
import Image from "next/image";
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
];

const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  siteConfig.addressShort,
)}&output=embed`;

const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.addressShort,
)}`;

const accessRoutes = [
  "東京メトロ銀座線・半蔵門線・副都心線「渋谷」駅 B3出口 徒歩2分",
  "JR線「渋谷」駅 宮益坂口 徒歩4分",
];

const accessAddressLines = [
  "〒150-0002",
  "東京都渋谷区渋谷1-12-2",
  "クロスオフィス渋谷609",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader title="会社情報" en="About" />
      <SubNav group="Company" items={companySubNav} />

      {/* MESSAGE — 代表写真は署名横の小さなアイコンに留め、メインビジュアルは企業イメージとして扱う */}
      <section id="message" className="bg-paper">
        <div className="relative overflow-hidden">
          <Image
            src="/natural-tech-about.webp"
            alt="自然光の入る空間で事業戦略を議論するJQITのチーム"
            width={1672}
            height={941}
            sizes="100vw"
            className="h-[260px] w-full object-cover object-[58%_45%] min-[720px]:h-[360px]"
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
            <div className="mt-10 flex items-center gap-6">
              <Image
                src="/representative-yamada.png"
                alt={`${siteConfig.ceo}の顔写真`}
                width={96}
                height={96}
                className="h-[96px] w-[96px] rounded-full border border-line bg-cream object-cover object-[50%_28%] shadow-[0_16px_34px_rgba(15,15,15,0.11)]"
              />
              <p className="flex flex-col gap-1 min-[520px]:flex-row min-[520px]:items-baseline min-[520px]:gap-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  代表取締役社長
                </span>
                <span className="palt text-xl font-bold text-ink">{siteConfig.ceo}</span>
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* COMPANY PROFILE */}
      <section className="border-t border-line bg-paper py-20 min-[720px]:py-[92px]">
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

      {/* ACCESS */}
      <section id="access" className="border-t border-line bg-cream py-20 min-[720px]:py-[92px]">
        <Container>
          <SectionHead kicker="Access" title="アクセス" className="mb-10" />
          <FadeIn className="grid grid-cols-1 overflow-hidden border border-line bg-paper min-[900px]:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[320px] bg-white min-[720px]:min-h-[420px]">
              <iframe
                title="JQIT本社周辺のGoogle Map"
                src={mapEmbedSrc}
                className="absolute inset-0 h-full w-full border-0 grayscale-[15%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col justify-center border-t border-line p-8 min-[720px]:p-10 min-[900px]:border-l min-[900px]:border-t-0 min-[1040px]:p-12">
              <Kicker className="mb-6">Office</Kicker>
              <div className="space-y-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
                    Address
                  </p>
                  <p className="mt-3 text-[15px] font-semibold leading-[1.9] text-ink min-[720px]:text-[17px]">
                    {accessAddressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
                    Train
                  </p>
                  <ul className="mt-3 space-y-3 text-[14px] leading-[1.9] text-body min-[720px]:text-[15px]">
                    {accessRoutes.map((route) => (
                      <li key={route} className="flex gap-3">
                        <span aria-hidden className="mt-[0.75em] h-1.5 w-1.5 shrink-0 bg-brand" />
                        <span>{route}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className="group mt-9 inline-flex w-fit items-center gap-2.5 border-b border-ink pb-1 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-brand hover:text-brand"
              >
                Google Map
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
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
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
