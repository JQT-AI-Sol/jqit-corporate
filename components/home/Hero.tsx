import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* ダイヤ型コラージュKV（白背景・赤アクセント）。高さ基準で右端に固定し、
          収まらない左側（KV内の白余白）は画面外へ逃がす */}
      <div className="absolute inset-y-0 right-0 hidden min-[1280px]:block">
        <div className="relative h-full" style={{ aspectRatio: "1792 / 1008" }}>
          <Image
            src="/hero-collage.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 900px) 70vw, 100vw"
            className="object-cover object-right"
          />
        </div>
        {/* 左からの白グラデーションで見出しの可読性を担保 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-white from-0% via-white/95 via-18% via-white/60 via-36% to-transparent to-68%"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1160px] px-6">
        <div className="flex min-h-0 flex-col justify-center pb-10 pt-14 min-[1280px]:min-h-[660px] min-[1280px]:py-20">
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
              <Button
                href="/contact"
                variant="outline"
                className="bg-white/95 backdrop-blur-sm"
              >
                お問い合わせ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* モバイル: テキスト下にコラージュ。帯状クロップだとダイヤ形状が中途半端に切れるため、
          天地は切らず「KV右側のコラージュ部分」を横方向のみトリミングして原寸比で見せる */}
      <div className="relative overflow-hidden min-[1280px]:hidden">
        <Image
          src="/hero-collage.webp"
          alt="JQITのメンバーとオフィスの写真コラージュ"
          width={1792}
          height={1008}
          priority
          sizes="100vw"
          className="ml-[-39%] h-auto w-[139%] max-w-none min-[600px]:ml-[-18%] min-[600px]:w-[118%]"
        />
      </div>
    </section>
  );
}
