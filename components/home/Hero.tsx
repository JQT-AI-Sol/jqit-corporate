import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream">
      {/* フルブリード写真（デスクトップ: 背景 / モバイル: テキスト下に全幅表示） */}
      <div className="absolute inset-0 hidden min-[900px]:block">
        <Image
          src="/hero-wide.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        {/* 左からのクリームグラデーションで見出しの可読性を確保 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-cream via-cream/70 via-45% to-transparent"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1160px] px-6">
        <div className="flex min-h-0 flex-col justify-center pb-10 pt-14 min-[900px]:min-h-[620px] min-[900px]:py-20 min-[1200px]:min-h-[660px]">
          <div className="max-w-[640px]">
            <div className="hero-rise">
              <Kicker className="mb-7">JQIT Corporate Site</Kicker>
            </div>
            <h1 className="palt text-[44px] font-bold leading-[1.16] tracking-[-0.03em] text-ink min-[720px]:text-[60px] min-[1200px]:text-[72px]">
              <span className="hero-rise inline-block [animation-delay:80ms]">
                挑戦と革新で、
              </span>
              <br />
              <span className="hero-rise inline-block [animation-delay:180ms]">
                顧客の<span className="text-brand">未来</span>を
              </span>
              <span className="hero-rise inline-block [animation-delay:180ms]">
                切り拓く。
              </span>
            </h1>
            <p className="hero-rise mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted [animation-delay:320ms]">
              Challenge &amp; Innovation — Since 2024
            </p>
            <p className="hero-rise mt-7 max-w-[470px] text-[16px] leading-[2.05] text-body [animation-delay:400ms]">
              私たちは、技術の力でお客様の“本質的な課題”を解決するITのプロフェッショナル集団です。ITとAI、ふたつのソリューションで企業の挑戦を支えます。
            </p>
            <div className="hero-rise mt-10 flex flex-wrap gap-4 [animation-delay:500ms]">
              <Button href="/#business">事業を見る</Button>
              <Button href="/contact" variant="outline">
                お問い合わせ
              </Button>
            </div>
          </div>
        </div>

        {/* Missionカード（デスクトップ: 写真の上・右下） */}
        <div className="absolute bottom-10 right-6 hidden rounded-card border border-line bg-white/95 px-5 py-4 backdrop-blur-sm min-[1100px]:block">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-brand">
            Our Mission
          </p>
          <p className="palt text-[13px] font-semibold leading-[1.7] text-ink">
            課題の“本質”を捉える、
            <br />
            伴走者であること。
          </p>
        </div>
      </div>

      {/* モバイル: テキスト下に全幅写真 */}
      <div className="relative min-[900px]:hidden">
        <Image
          src="/hero-wide.png"
          alt="モニターを囲んで議論するJQITのエンジニアチーム"
          width={3168}
          height={1344}
          priority
          sizes="100vw"
          className="h-[300px] w-full object-cover object-[68%_center] min-[600px]:h-[360px]"
        />
        <div className="absolute bottom-4 left-6 rounded-card border border-line bg-white/95 px-4 py-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
            Our Mission
          </p>
          <p className="palt text-[12px] font-semibold leading-[1.7] text-ink">
            課題の“本質”を捉える、伴走者であること。
          </p>
        </div>
      </div>
    </section>
  );
}
