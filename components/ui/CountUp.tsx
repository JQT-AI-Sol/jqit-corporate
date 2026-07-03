"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** 交差時に 0 → 目標値へカウントアップ（DS: JqitCareers.CountUp の移植） */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const trimmed = value.trim();
    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return;
    const target = Number(trimmed);
    const dot = trimmed.indexOf(".");
    const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        rafId = requestAnimationFrame((start) => {
          setDisplay((0).toFixed(decimals));
          const tick = (now: number) => {
            const progress = Math.min((now - start) / DURATION_MS, 1);
            setDisplay((target * easeOutCubic(progress)).toFixed(decimals));
            if (progress < 1) rafId = requestAnimationFrame(tick);
            else setDisplay(target.toFixed(decimals));
          };
          rafId = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
