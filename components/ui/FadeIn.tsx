"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * スクロールで現れるリビール。すでに画面内にある要素は最初から表示する
 * （デザイン原本 JQIT.dc.html のロジックを移植）。
 */
export function FadeIn({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    // すでに画面内なら表示のまま
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // 安全弁: コンテンツを隠したままにしない
    const timer = window.setTimeout(() => setHidden(false), 2600);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} data-hidden={hidden} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
