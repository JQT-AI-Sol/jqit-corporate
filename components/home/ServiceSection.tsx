import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { siteConfig } from "@/lib/site-config";

const features = [
  {
    title: "AIマッチング",
    body: "生成AIが案件と人材を高精度にマッチング。営業未経験でも精度の高い提案を実現します。",
  },
  {
    title: "案件・人材の一元管理",
    body: "散在しがちな案件・要員・取引先の情報をひとつのダッシュボードに集約します。",
  },
  {
    title: "書類の自動発行",
    body: "契約書類・請求書を自動生成。SES営業のバックオフィス工数を大幅に削減します。",
  },
];

export function ServiceSection() {
  return (
    <section id="service" className="overflow-hidden border-t border-line bg-cream py-20 min-[720px]:py-24">
      <Container>
        <FadeIn>
          <DisplayText className="-ml-1 mb-8">PRODUCT</DisplayText>
        </FadeIn>
        <div className="grid grid-cols-1 items-center gap-12 min-[1024px]:grid-cols-[1fr_1.05fr] min-[1024px]:gap-14">
          <FadeIn>
            <Kicker className="mb-4">Product</Kicker>
            <h2 className="palt text-[28px] font-bold leading-[1.4] tracking-[-0.02em] text-ink md:text-[38px]">
              SES営業を変える、
              <br />
              <span className="text-brand">NOVA</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[2.1] text-body">
              自社開発のSES営業効率化ツール。AIマッチングから契約書類の自動発行まで、SESビジネスの業務をワンストップで支えます。
            </p>
            <div className="mt-7 space-y-4">
              {features.map((f) => (
                <div key={f.title} className="flex gap-3.5">
                  <span aria-hidden className="mt-[9px] h-0.5 w-5 shrink-0 bg-brand" />
                  <div>
                    <p className="text-[15px] font-bold text-ink">{f.title}</p>
                    <p className="mt-1 text-[13px] leading-[1.9] text-muted">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a
                href={siteConfig.links.nova}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-card bg-ink px-8 py-[15px] text-sm font-bold tracking-[0.02em] text-white transition-colors hover:bg-brand"
              >
                <span>NOVA 製品サイトへ</span>
                <span
                  aria-hidden
                  className="font-mono transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="rounded-2xl border border-line bg-white p-6 min-[720px]:p-10">
              <Image
                src="/nova-product.png"
                alt="NOVA 管理画面 — AIマッチングアシスタントと案件一覧"
                width={748}
                height={438}
                className="h-auto w-full"
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
