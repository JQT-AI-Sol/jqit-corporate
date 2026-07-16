# About Trust Signals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace weak company-number cards in the home ABOUT section with one organization-scale card and three customer-facing trust credentials.

**Architecture:** `AboutSection.tsx` owns a small static `trustSignals` presentation model because the four cards are unique to the home page. Existing badge assets remain the source of official marks, while the company profile page continues to own founding-year, business-count, and capital information.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node.js built-in test runner

## Global Constraints

- Keep the existing two-by-two grid and ABOUT copy.
- Keep employee count `106名（2026年4月時点）` as the only numerical proof point.
- Show `ISO/IEC 27001（ISMS）`, `DX認定`, and `ISTQB® Gold パートナー` using existing badge assets.
- Remove `2024年`, `2事業`, and `1,000万円` from the home ABOUT cards only.
- Do not add unpublished project, customer, retention, or certification-count metrics.
- Every badge image has meaningful alt text.

---

### Task 1: About Trust-Signal Regression Test

**Files:**
- Create: `tests/about-trust-signals.test.mts`

**Interfaces:**
- Verifies: removal of weak number cards and presence of the four approved trust signals

- [ ] **Step 1: Write the failing source-level regression test**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("home about section presents customer trust signals", () => {
  const source = readFileSync("components/home/AboutSection.tsx", "utf8");

  assert.doesNotMatch(source, /Founded|Capital|IT × AI Solutions/);
  assert.doesNotMatch(source, /CountUp/);
  assert.match(source, /106名の組織体制/);
  assert.match(source, /ISO\/IEC 27001（ISMS）/);
  assert.match(source, /DX認定事業者/);
  assert.match(source, /ISTQB® Gold パートナー/);
  assert.match(source, /\/badges\/isms-iso27001\.png/);
  assert.match(source, /\/badges\/dx-nintei\.png/);
  assert.match(source, /\/badges\/istqb-gold\.png/);
});
```

- [ ] **Step 2: Run the test and verify the old number cards fail it**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/about-trust-signals.test.mts`

Expected: FAIL because `CountUp`, `Founded`, `Capital`, and `IT × AI Solutions` remain in `AboutSection.tsx`.

### Task 2: Trust-Signal Card Implementation

**Files:**
- Modify: `components/home/AboutSection.tsx`

**Interfaces:**
- Produces: `trustSignals` with `name`, `description`, optional `meta`, and optional `image`
- Consumes: `/badges/isms-iso27001.png`, `/badges/dx-nintei.png`, `/badges/istqb-gold.png`

- [ ] **Step 1: Replace the CountUp import and stats model**

Use these imports and data:

```tsx
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHead } from "@/components/ui/SectionHead";

const trustSignals = [
  {
    name: "106名の組織体制",
    description: "IT・AIの両事業を支える組織",
    meta: "2026年4月時点",
  },
  {
    name: "ISO/IEC 27001（ISMS）",
    description: "情報セキュリティ管理体制を構築・運用",
    image: { src: "/badges/isms-iso27001.png", width: 200, height: 78 },
  },
  {
    name: "DX認定事業者",
    description: "経営とデジタル変革を一体で推進",
    image: { src: "/badges/dx-nintei.png", width: 1736, height: 492 },
  },
  {
    name: "ISTQB® Gold パートナー",
    description: "ソフトウェア品質・テスト分野の専門性",
    image: { src: "/badges/istqb-gold.png", width: 2063, height: 738 },
  },
] as const;
```

- [ ] **Step 2: Replace the numeric grid renderer**

Use this renderer inside the existing right-side `FadeIn` grid:

```tsx
{trustSignals.map((signal) => (
  <article
    key={signal.name}
    className="flex min-h-[190px] flex-col bg-white px-5 py-6 min-[720px]:min-h-[220px] min-[720px]:px-7 min-[720px]:py-8"
  >
    {"image" in signal ? (
      <div className="flex h-11 items-center">
        <Image
          src={signal.image.src}
          alt={signal.name}
          width={signal.image.width}
          height={signal.image.height}
          className="max-h-10 w-auto max-w-full object-contain object-left"
        />
      </div>
    ) : (
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
        Organization
      </p>
    )}
    <div className="mt-auto pt-6">
      <h3 className="palt text-[16px] font-bold leading-[1.55] text-ink min-[720px]:text-[18px]">
        {signal.name}
      </h3>
      <p className="mt-2 text-[12px] leading-[1.8] text-body min-[720px]:text-[13px]">
        {signal.description}
      </p>
      {"meta" in signal && (
        <p className="mt-2 font-mono text-[9.5px] tracking-[0.1em] text-muted">
          {signal.meta}
        </p>
      )}
    </div>
  </article>
))}
```

- [ ] **Step 3: Run focused tests and lint**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/about-trust-signals.test.mts && npm run lint -- components/home/AboutSection.tsx tests/about-trust-signals.test.mts`

Expected: one passing test and no lint errors.

### Task 3: Full and Responsive Verification

**Files:**
- Modify only `components/home/AboutSection.tsx` if verification exposes a layout defect

**Interfaces:**
- Verifies: `/` ABOUT section at desktop and mobile breakpoints

- [ ] **Step 1: Run the complete test, lint, and build checks**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mts && npx eslint . --ignore-pattern '.worktrees/**' && npm run build`

Expected: all tests pass, lint reports no errors, and Next.js completes the production build.

- [ ] **Step 2: Inspect the local page at responsive widths**

At 375px, 768px, 1024px, and 1440px verify that all four cards remain readable, certification logos retain their aspect ratios, no label is clipped, and no horizontal overflow appears.
