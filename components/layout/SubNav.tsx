"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SubNavItem = {
  label: string;
  href: string;
};

/** Company 配下（会社情報グループ）のローカルナビ */
export const companySubNav: SubNavItem[] = [
  { label: "会社情報", href: "/about" },
  { label: "ビジョンと戦略", href: "/corporate-vision" },
  { label: "情報セキュリティ基本方針", href: "/security-policy" },
];

/** Business 配下（事業グループ）のローカルナビ */
export const businessSubNav: SubNavItem[] = [
  { label: "ITソリューション事業", href: "/business/it-solutions" },
  { label: "AIソリューション事業", href: "/business/ai-solutions" },
];

/**
 * PageHeader 直下に置く同一グループ内のタブナビ。
 * 「ビジョンと戦略」「セキュリティ基本方針」など、グローバルナビに
 * 出しづらい配下ページへの導線をページ側で明示する。
 */
export function SubNav({ group, items }: { group: string; items: SubNavItem[] }) {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "") || "/";

  return (
    <nav
      aria-label={`${group}のページ一覧`}
      className="border-b border-line bg-white"
    >
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-stretch gap-1 px-4 min-[720px]:flex-nowrap min-[720px]:overflow-x-auto min-[720px]:px-6">
        <span className="mr-4 hidden items-center self-stretch font-mono text-[10px] uppercase tracking-[0.2em] text-muted min-[720px]:flex">
          {group}
        </span>
        {items.map((item) => {
          const active = normalized === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative whitespace-nowrap px-3 py-3.5 text-[12px] font-semibold transition-colors min-[720px]:px-4 min-[720px]:py-[17px] min-[720px]:text-[13px] ${
                active ? "text-ink" : "text-muted hover:text-brand"
              }`}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-0.5 bg-brand min-[720px]:inset-x-4"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
