import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHead } from "@/components/ui/SectionHead";

const stats = [
  { value: "2024", unit: "年", label: "Founded" },
  { value: "106", unit: "名", label: "Members (2026.4)" },
  { value: "2", unit: "事業", label: "IT × AI Solutions" },
  { value: "1,000", unit: "万円", label: "Capital" },
];

export function AboutSection() {
  return (
    <section id="about" className="overflow-hidden border-t border-line bg-cream py-20 min-[720px]:py-24">
      <Container>
        <FadeIn>
          <DisplayText className="-ml-1 mb-8">ABOUT US</DisplayText>
        </FadeIn>
        <div className="grid grid-cols-1 items-start gap-12 min-[1024px]:grid-cols-2 min-[1024px]:gap-16">
          <div>
            <SectionHead
              kicker="About"
              title={
                <>
                  課題の“本質”を捉える、
                  <br />
                  <span className="text-brand">伴走者</span>であり続ける。
                </>
              }
              lead="株式会社JQITは、システム開発・インフラ・QAを担うITソリューション事業と、生成AI・AIエージェント開発を担うAIソリューション事業の両輪で、お客様のビジネスを技術で支えるITカンパニーです。"
            />
            <FadeIn className="mt-8">
              <Button href="/about" variant="arrow">
                JQITについて知る
              </Button>
            </FadeIn>
          </div>
          <FadeIn className="grid grid-cols-2 gap-px border border-line bg-line">
            {stats.map((s) => (
              <div key={s.label} className="bg-white px-4 py-6 min-[720px]:px-[26px] min-[720px]:py-[30px]">
                {/* 数値＋単位は常に同一行（桁数による折り返し不統一を防ぐ） */}
                <p className="font-en whitespace-nowrap text-[34px] font-semibold leading-none tracking-[-0.02em] text-ink min-[720px]:text-[58px]">
                  <CountUp value={s.value} />
                  <span className="ml-1 text-[16px] font-bold text-brand min-[720px]:text-[24px]">
                    {s.unit}
                  </span>
                </p>
                <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
