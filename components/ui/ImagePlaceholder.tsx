/**
 * 実素材が入るまでの写真・ロゴプレースホルダ。
 * 実画像に差し替える際は next/image の <Image> に置き換える。
 */
export function ImagePlaceholder({
  label = "Photo",
  ratio,
  radius = 16,
  bg = "#efece8",
  className = "",
  ariaLabel,
}: {
  label?: string;
  /** 例: "4 / 5" */
  ratio?: string;
  radius?: number;
  /** 背景色（CSS値） */
  bg?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <figure
      role="img"
      aria-label={ariaLabel ?? label}
      className={`flex flex-col items-center justify-center gap-2 overflow-hidden text-ink/35 ${className}`}
      style={{ aspectRatio: ratio, borderRadius: radius, background: bg }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="opacity-50"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <figcaption className="font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
      </figcaption>
    </figure>
  );
}
