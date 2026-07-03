import type { Metadata } from "next";
import { StaticContactForm } from "@/components/contact/StaticContactForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { siteConfig } from "@/lib/site-config";

/**
 * 静的エクスポート（GitHub Pages）用のお問い合わせページ。
 * Server Actions が使えないため、既存HPの Contact Form 7 に直接送信する
 * クライアントフォーム（StaticContactForm）を使う。
 * CI（scripts/prepare-static-export.mjs）が app/contact/page.tsx をこれで置き換える。
 */
export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "JQIT株式会社へのお問い合わせ。サービス・採用・協業など、お気軽にご相談ください。",
};

const directInfos = [
  { label: "Tel", value: siteConfig.tel, en: true },
  { label: "Fax", value: siteConfig.fax, en: true },
  { label: "Address", value: siteConfig.addressShort, en: false },
  { label: "Hours", value: siteConfig.businessHours, en: false },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader title="お問い合わせ" en="Contact" />
      <section className="bg-paper pb-24 pt-16 min-[720px]:pt-20">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 min-[1024px]:grid-cols-[1.5fr_1fr] min-[1024px]:gap-16">
            <FadeIn>
              <p className="mb-9 text-[15px] leading-[2.05] text-body">
                サービス・採用・協業など、JQITへのお問い合わせは下記フォームよりお願いいたします。
                <span className="text-brand">*</span>{" "}
                は必須項目です。担当者より2〜3営業日以内にご連絡いたします。
              </p>
              <StaticContactForm />
            </FadeIn>
            <FadeIn className="border border-line bg-cream px-8 py-9">
              <Kicker className="mb-6">Direct</Kicker>
              {directInfos.map((info) => (
                <div key={info.label} className="border-b border-line py-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {info.label}
                  </p>
                  <p
                    className={`${info.en ? "font-en text-[17px] font-medium" : "text-[15px]"} leading-[1.7] text-ink`}
                  >
                    {info.value}
                  </p>
                </div>
              ))}
              <p className="mt-5 text-[12.5px] leading-[1.9] text-muted">
                お電話でのお問い合わせは営業時間内にお願いいたします。
              </p>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
