import type { ReactNode } from "react";

/** 見出し肩ラベル: 赤24px線 + mono大文字 */
export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="inline-block h-0.5 w-6 bg-brand" />
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
        {children}
      </span>
    </p>
  );
}
