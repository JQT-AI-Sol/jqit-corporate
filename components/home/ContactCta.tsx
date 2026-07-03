import { Button } from "@/components/ui/Button";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
import { siteConfig } from "@/lib/site-config";

export function ContactCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-paper py-20 min-[720px]:py-[92px]">
      <TechBackdrop />
      <div className="relative mx-auto w-full max-w-[1160px] px-6 text-center">
        <FadeIn>
          <div className="flex justify-center">
            <DisplayText className="mb-6">CONTACT</DisplayText>
          </div>
          <Kicker className="mb-5">Contact</Kicker>
          <h2 className="palt text-[30px] font-bold leading-[1.4] tracking-[-0.02em] text-ink min-[720px]:text-[42px]">
            <span className="inline-block">お気軽に、</span>
            <span className="inline-block">
              <span className="text-brand">ご相談</span>ください。
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15px] leading-[2.05] text-body">
            サービス・採用・協業など、JQITへのお問い合わせはこちらから。担当者より折り返しご連絡いたします。
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button href="/contact">お問い合わせフォーム</Button>
            <a
              href={siteConfig.telHref}
              className="inline-flex items-center gap-2.5 rounded-card border border-ink px-6 py-[13px] text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              <span className="font-mono tracking-[0.06em]">TEL {siteConfig.tel}</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
