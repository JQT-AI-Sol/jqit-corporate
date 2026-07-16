import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { siteConfig } from "@/lib/site-config";

const services = [
  {
    id: "nova",
    label: "Product",
    name: "NOVA",
    heading: "SES営業を変える、NOVA",
    description:
      "AIマッチングから契約書類の自動発行まで、SESビジネスの業務をワンストップで支える営業支援プラットフォームです。",
    features: ["AIマッチング", "案件・人材の一元管理", "書類の自動発行"],
    href: siteConfig.links.nova,
    cta: "NOVA 製品サイトへ",
  },
  {
    id: "ai-support",
    label: "AI Automation",
    name: "AI導入伴走支援",
    heading: "手作業を減らす、AI導入伴走支援",
    description:
      "いま使っている業務アプリを活かしながら、現場で動くAIエージェントの導入まで3か月で伴走します。",
    features: ["業務の棚卸しから設計", "既存アプリを活用", "運用と内製化まで支援"],
    href: siteConfig.links.aiSupport,
    cta: "AI導入伴走支援を見る",
  },
] as const;

export function ServiceSection() {
  return (
    <section
      id="service"
      className="overflow-hidden border-t border-line bg-cream py-20 min-[720px]:py-24"
    >
      <Container>
        <FadeIn>
          <DisplayText className="-ml-1 mb-8">SERVICES</DisplayText>
          <Kicker className="mb-4">Services</Kicker>
          <h2 className="palt text-[28px] font-bold leading-[1.4] tracking-[-0.02em] text-ink md:text-[38px]">
            JQITの<span className="text-brand">サービス</span>
          </h2>
          <p className="mt-4 max-w-[680px] text-[15px] leading-[2] text-body">
            業務に寄り添うプロダクトと、現場への導入まで伴走する支援サービスで、企業の変革を前に進めます。
          </p>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-6 min-[1024px]:grid-cols-2">
          {services.map((service) => (
            <FadeIn key={service.id}>
              <article className="flex h-full flex-col overflow-hidden border border-line bg-white">
                {service.id === "nova" ? (
                  <div className="flex min-h-[220px] items-center bg-[#f4f4f2] p-6 min-[720px]:p-8">
                    <Image
                      src="/nova-product.png"
                      alt="NOVA 管理画面 — AIマッチングアシスタントと案件一覧"
                      width={748}
                      height={438}
                      className="h-auto w-full"
                    />
                  </div>
                ) : (
                  <div className="relative flex min-h-[220px] items-end overflow-hidden bg-ink p-7 min-[720px]:p-8">
                    <p
                      aria-hidden
                      className="font-anton absolute -right-1 -top-3 text-[132px] leading-none text-white/[0.05]"
                    >
                      AI
                    </p>
                    <div
                      aria-hidden
                      className="absolute inset-y-0 right-[18%] w-px bg-white/10"
                    />
                    <div className="relative">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brand">
                        JQIT AI AUTOMATION
                      </p>
                      <p className="palt mt-3 max-w-[360px] text-[24px] font-bold leading-[1.45] text-white min-[720px]:text-[28px]">
                        転記・確認・通知を、
                        <br />
                        AIで減らす。
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-7 min-[720px]:p-8">
                  <Kicker className="mb-4">{service.label}</Kicker>
                  <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
                    {service.name}
                  </p>
                  <h3 className="palt mt-2 text-[22px] font-bold leading-[1.5] text-ink">
                    {service.heading}
                  </h3>
                  <p className="mt-4 text-[14px] leading-[2] text-body">
                    {service.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-[14px] font-semibold text-ink"
                      >
                        <span aria-hidden className="h-0.5 w-5 shrink-0 bg-brand" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-card bg-ink px-7 py-[14px] text-sm font-bold tracking-[0.02em] text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand min-[600px]:w-fit"
                  >
                    <span>{service.cta}</span>
                    <span
                      aria-hidden
                      className="font-mono transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
