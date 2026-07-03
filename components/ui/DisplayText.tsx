/**
 * セクション見出しの背後に敷く超大型英字ディスプレイタイポ（装飾）。
 * SHIFT・モンスターラボ等の国内テック企業サイトに共通する「文字を図形として使う」手法。
 * フォントサイズは vw ベースの clamp で、長い単語（SUSTAINABILITY等）もモバイルで見切れない。
 */
export function DisplayText({
  children,
  tone = "ink",
  size = "lg",
  className = "",
}: {
  children: string;
  tone?: "ink" | "white";
  size?: "lg" | "md";
  className?: string;
}) {
  const sizeCls =
    size === "lg"
      ? "text-[clamp(38px,10.5vw,136px)]"
      : "text-[clamp(32px,7.5vw,88px)]";
  return (
    <p
      aria-hidden
      className={`font-anton select-none whitespace-nowrap leading-[0.85] tracking-[0.02em] ${
        tone === "ink" ? "text-ink/[0.05]" : "text-white/[0.06]"
      } ${sizeCls} ${className}`}
    >
      {children}
    </p>
  );
}
