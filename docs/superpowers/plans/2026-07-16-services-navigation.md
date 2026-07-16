# Services Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the NOVA-only product route with a two-service navigation and home section, while removing the redundant home contact panel.

**Architecture:** `lib/site-config.ts` remains the source of truth for both external service URLs and navigation metadata. `SiteHeader` renders external child links from that metadata, while `ServiceSection` presents two equal responsive cards and the home page composition removes the unused contact section.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node.js built-in test runner

## Global Constraints

- The service links are `https://nova-ai.jp/` and `https://ai.jqit.co.jp/`.
- Both service destinations open in a new tab with `noopener noreferrer`.
- The parent service navigation continues to point to `/#service`.
- The existing JQIT red, black, cream, and typography system remains unchanged.
- The service cards use one column on mobile and two columns at 1024px and above.
- The home contact panel is removed; the desktop and mobile header contact routes remain.

---

### Task 1: Service Route Regression Tests

**Files:**
- Create: `tests/service-navigation.test.mts`
- Modify: `tests/contact-routes.test.mts`

**Interfaces:**
- Verifies: service navigation metadata, both home service cards, and removal of the home contact panel
- Preserves: exactly two `/contact` links in `components/layout/SiteHeader.tsx`

- [ ] **Step 1: Write failing service-navigation tests**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("service navigation exposes NOVA and AI implementation support", () => {
  const config = readFileSync("lib/site-config.ts", "utf8");
  assert.match(config, /label: "サービス", en: "Service", href: "\/#service"/);
  assert.match(config, /aiSupport: "https:\/\/ai\.jqit\.co\.jp\/"/);
  assert.match(config, /label: "NOVA"[\s\S]*external: true/);
  assert.match(config, /label: "AI導入伴走支援"[\s\S]*external: true/);
});

test("home service section presents both external destinations", () => {
  const source = readFileSync("components/home/ServiceSection.tsx", "utf8");
  assert.match(source, />SERVICES</);
  assert.match(source, /siteConfig\.links\.nova/);
  assert.match(source, /siteConfig\.links\.aiSupport/);
});
```

- [ ] **Step 2: Change the home contact assertion**

Replace the old `ContactCta.tsx` assertion with:

```ts
test("the home page omits the redundant contact section", () => {
  const source = readFileSync("app/page.tsx", "utf8");
  assert.doesNotMatch(source, /ContactCta/);
});
```

- [ ] **Step 3: Run tests and confirm the new requirements fail**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/service-navigation.test.mts tests/contact-routes.test.mts`

Expected: FAIL because the service metadata, second card, and home contact removal are not implemented.

### Task 2: Shared Service Navigation

**Files:**
- Modify: `lib/site-config.ts`
- Modify: `components/layout/SiteHeader.tsx`

**Interfaces:**
- Produces: `siteConfig.links.aiSupport: "https://ai.jqit.co.jp/"`
- Produces: `NavChild.external?: boolean`
- Consumes: `globalNav` service children in desktop and mobile header renderers

- [ ] **Step 1: Add the external URL and service children**

Add the URL, external child field, and service navigation entry:

```ts
links: {
  recruit: "https://jqt-ai-sol.github.io/jqit-careers/",
  nova: "https://nova-ai.jp/",
  aiSupport: "https://ai.jqit.co.jp/",
  qiita: "https://qiita.com/organizations/jqiit-co",
  note: "https://note.com/jqit_itsaiyo",
  x: "https://x.com/JQIT_info",
  instagram: "https://www.instagram.com/jqit202412/",
},

export type NavChild = {
  label: string;
  href: string;
  external?: boolean;
};

{
  label: "サービス",
  en: "Service",
  href: "/#service",
  children: [
    { label: "NOVA", href: siteConfig.links.nova, external: true },
    { label: "AI導入伴走支援", href: siteConfig.links.aiSupport, external: true },
  ],
},
```

Add `{ label: "AI導入伴走支援", href: siteConfig.links.aiSupport, external: true }` after NOVA in the footer Business links.

- [ ] **Step 2: Render external child links safely**

For both desktop and mobile child `<Link>` elements, add:

```tsx
target={child.external ? "_blank" : undefined}
rel={child.external ? "noopener noreferrer" : undefined}
```

Use `{child.external ? "↗" : "→"}` for the desktop arrow and append a muted `↗` marker to external mobile child labels.

- [ ] **Step 3: Run the focused test and lint**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/service-navigation.test.mts && npm run lint -- lib/site-config.ts components/layout/SiteHeader.tsx tests/service-navigation.test.mts`

Expected: the navigation test that inspects configuration passes, and lint reports no errors.

### Task 3: Two-Service Home Section

**Files:**
- Modify: `components/home/ServiceSection.tsx`

**Interfaces:**
- Consumes: `siteConfig.links.nova`
- Consumes: `siteConfig.links.aiSupport`
- Preserves: section id `service`

- [ ] **Step 1: Replace the single product layout with a two-card section**

Replace the file with:

```tsx
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DisplayText } from "@/components/ui/DisplayText";
import { FadeIn } from "@/components/ui/FadeIn";
import { Kicker } from "@/components/ui/Kicker";
import { siteConfig } from "@/lib/site-config";

const services = [
  {
    id: "nova",
    label: "Product",
    name: "NOVA",
    heading: "SES営業を変える、NOVA",
    description:
      "AIマッチングから契約書類の自動発行まで、SESビジネスの業務をワンストップで支える営業支援プラットフォームです。",
    features: ["AIマッチング", "案件・人材の一元管理", "書類の自動発行"],
    href: siteConfig.links.nova,
    cta: "NOVA 製品サイトへ",
  },
  {
    id: "ai-support",
    label: "AI Automation",
    name: "AI導入伴走支援",
    heading: "手作業を減らす、AI導入伴走支援",
    description:
      "いま使っている業務アプリを活かしながら、現場で動くAIエージェントの導入まで3か月で伴走します。",
    features: ["業務の棚卸しから設計", "既存アプリを活用", "運用と内製化まで支援"],
    href: siteConfig.links.aiSupport,
    cta: "AI導入伴走支援を見る",
  },
] as const;

export function ServiceSection() {
  return (
<section id="service" className="overflow-hidden border-t border-line bg-cream py-20 min-[720px]:py-24">
  <Container>
    <FadeIn>
      <DisplayText className="-ml-1 mb-8">SERVICES</DisplayText>
      <Kicker className="mb-4">Services</Kicker>
      <h2 className="palt text-[28px] font-bold leading-[1.4] tracking-[-0.02em] text-ink md:text-[38px]">
        JQITの<span className="text-brand">サービス</span>
      </h2>
      <p className="mt-4 max-w-[680px] text-[15px] leading-[2] text-body">
        業務に寄り添うプロダクトと、現場への導入まで伴走する支援サービスで、企業の変革を前に進めます。
      </p>
    </FadeIn>
    <div className="mt-10 grid grid-cols-1 gap-6 min-[1024px]:grid-cols-2">
      {services.map((service) => (
        <FadeIn key={service.id}>
          <article className="flex h-full flex-col overflow-hidden border border-line bg-white">
            {service.id === "nova" ? (
              <div className="flex min-h-[220px] items-center bg-[#f4f4f2] p-6 min-[720px]:p-8">
                <Image
                  src="/nova-product.png"
                  alt="NOVA 管理画面 — AIマッチングアシスタントと案件一覧"
                  width={748}
                  height={438}
                  className="h-auto w-full"
                />
              </div>
            ) : (
              <div className="relative flex min-h-[220px] items-end overflow-hidden bg-ink p-7 min-[720px]:p-8">
                <p aria-hidden className="font-anton absolute -right-1 -top-3 text-[132px] leading-none text-white/[0.05]">
                  AI
                </p>
                <div aria-hidden className="absolute inset-y-0 right-[18%] w-px bg-white/10" />
                <div className="relative">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brand">
                    JQIT AI AUTOMATION
                  </p>
                  <p className="mt-3 max-w-[360px] palt text-[24px] font-bold leading-[1.45] text-white min-[720px]:text-[28px]">
                    転記・確認・通知を、<br />AIで減らす。
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-1 flex-col p-7 min-[720px]:p-8">
              <Kicker className="mb-4">{service.label}</Kicker>
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
                {service.name}
              </p>
              <h3 className="palt mt-2 text-[22px] font-bold leading-[1.5] text-ink">
                {service.heading}
              </h3>
              <p className="mt-4 text-[14px] leading-[2] text-body">{service.description}</p>
              <ul className="mt-6 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[14px] font-semibold text-ink">
                    <span aria-hidden className="h-0.5 w-5 shrink-0 bg-brand" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-card bg-ink px-7 py-[14px] text-sm font-bold tracking-[0.02em] text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand min-[600px]:w-fit"
              >
                <span>{service.cta}</span>
                <span aria-hidden className="font-mono transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  </Container>
</section>
  );
}
```

- [ ] **Step 2: Run focused tests and lint**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/service-navigation.test.mts && npm run lint -- components/home/ServiceSection.tsx`

Expected: both service-navigation tests pass and lint reports no errors.

### Task 4: Remove the Redundant Home Contact Panel

**Files:**
- Modify: `app/page.tsx`
- Delete: `components/home/ContactCta.tsx`
- Modify: `tests/contact-routes.test.mts`

**Interfaces:**
- Preserves: desktop and mobile `/contact` links in `SiteHeader`
- Removes: `ContactCta` import and render from `HomePage`

- [ ] **Step 1: Remove the component from the home composition**

Delete:

```tsx
import { ContactCta } from "@/components/home/ContactCta";
```

and:

```tsx
<ContactCta />
```

Delete `components/home/ContactCta.tsx` because it has no remaining consumer.

- [ ] **Step 2: Run all focused tests**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/contact-routes.test.mts tests/service-navigation.test.mts`

Expected: all contact-route and service-navigation tests pass.

### Task 5: Full and Responsive Verification

**Files:**
- Modify only the files above if verification exposes a defect

**Interfaces:**
- Verifies: `/`, desktop and mobile global navigation, both external service destinations, and the footer

- [ ] **Step 1: Run static verification**

Run: `npm run lint && npm run build`

Expected: lint reports no errors and Next.js completes the production build.

- [ ] **Step 2: Verify responsive rendering**

Open `/` at 375px, 768px, 1024px, and 1440px. Confirm the service cards switch from one to two columns at 1024px, no horizontal overflow appears, both CTAs are at least 44px high, and the removed CONTACT section is absent.

- [ ] **Step 3: Verify navigation behavior**

Confirm the desktop service dropdown and mobile service sublinks each expose NOVA and AI導入伴走支援, open the correct external URL in a new tab, and show visible focus states.
