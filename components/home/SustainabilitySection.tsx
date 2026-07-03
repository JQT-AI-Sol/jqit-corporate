import { Container } from "@/components/ui/Container";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHead } from "@/components/ui/SectionHead";

const pillars = [
  {
    no: "01",
    title: "人",
    body: "多様な人材が、長く安心して活躍できる環境づくり。学びと挑戦を支える制度を整えます。",
  },
  {
    no: "02",
    title: "技術",
    body: "確かな品質と情報セキュリティ（ISO/IEC 27001認証）で、社会から信頼されるシステムを届けます。",
  },
  {
    no: "03",
    title: "環境",
    body: "ペーパーレス・省エネをはじめ、事業活動を通じた環境負荷の低減に取り組みます。",
  },
];

export function SustainabilitySection() {
  return (
    <section id="sustainability" className="overflow-hidden border-t border-line bg-paper py-20 min-[720px]:py-24">
      <Container>
        <FadeIn>
          <DisplayText className="-ml-1 mb-8">SUSTAINABILITY</DisplayText>
        </FadeIn>
        <SectionHead
          kicker="Sustainability"
          title={
            <>
              技術を、<span className="text-brand">次の世代</span>へつなぐ。
            </>
          }
          lead="事業を通じて社会課題に向き合い、人と環境にやさしい持続可能な未来づくりに貢献します。"
          className="mb-12 max-w-[680px]"
        />
        <FadeIn className="grid grid-cols-1 gap-px border border-line bg-line min-[900px]:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.no} className="bg-white px-8 py-9">
              <p className="mb-4 font-mono text-[13px] font-semibold tracking-[0.08em] text-brand">
                {p.no}
              </p>
              <h3 className="palt text-[21px] font-bold text-ink">{p.title}</h3>
              <p className="mt-3.5 text-sm leading-[1.95] text-muted">{p.body}</p>
            </div>
          ))}
        </FadeIn>
      </Container>
    </section>
  );
}
