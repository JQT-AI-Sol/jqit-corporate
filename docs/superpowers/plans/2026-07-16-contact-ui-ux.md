# Contact UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve inquiry form drafts, improve mobile form usability, and limit prominent inquiry routes to the global header and the home page's final contact section.

**Architecture:** A small browser-only draft utility owns serialization, session storage, restoration, and cleanup for both inquiry form implementations. Existing uncontrolled forms connect to that utility through a form ref and effects, while page-level CTA cleanup remains presentational and does not change routing or submission behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node.js built-in test runner

## Global Constraints

- Keep both `ContactForm` and `StaticContactForm` behavior aligned.
- Store drafts only in `sessionStorage`; never persist the privacy checkbox.
- Clear the draft only after a successful submission.
- Keep the contact destination page and the privacy-policy contact-window link.
- Keep prominent inquiry routes in the global header/mobile menu and the home page's final contact section only.
- Do not add or publish performance/case-study content in this change.
- Mobile inputs use at least 16px text and interactive controls use at least 44px touch targets.

---

### Task 1: Contact Draft Utility

**Files:**
- Create: `lib/contact-draft.ts`
- Create: `tests/contact-draft.test.ts`

**Interfaces:**
- Produces: `connectContactDraft(form: HTMLFormElement): () => void`
- Produces: `clearContactDraft(): void`
- Produces: `buildContactDraft(entries: Iterable<[string, FormDataEntryValue]>): ContactDraft`
- Produces: `parseContactDraft(raw: string | null): ContactDraft`

- [ ] **Step 1: Write the failing draft serialization tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildContactDraft, parseContactDraft } from "../lib/contact-draft.ts";

test("buildContactDraft keeps text values and excludes privacy", () => {
  assert.deepEqual(
    buildContactDraft([
      ["name", "山田 太郎"],
      ["message", "相談内容"],
      ["privacy", "on"],
    ]),
    { name: "山田 太郎", message: "相談内容" },
  );
});

test("parseContactDraft rejects malformed and non-string values", () => {
  assert.deepEqual(parseContactDraft("not-json"), {});
  assert.deepEqual(
    parseContactDraft('{"name":"山田 太郎","privacy":"on","count":1}'),
    { name: "山田 太郎" },
  );
});
```

- [ ] **Step 2: Run the tests and verify the missing module failure**

Run: `node --test tests/contact-draft.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/contact-draft.ts`.

- [ ] **Step 3: Implement the browser draft utility**

```ts
export type ContactDraft = Record<string, string>;

const STORAGE_KEY = "jqit:contact-draft:v1";
const EXCLUDED_FIELDS = new Set(["privacy"]);

export function buildContactDraft(
  entries: Iterable<[string, FormDataEntryValue]>,
): ContactDraft {
  const draft: ContactDraft = {};
  for (const [name, value] of entries) {
    if (!EXCLUDED_FIELDS.has(name) && typeof value === "string") {
      draft[name] = value;
    }
  }
  return draft;
}

export function parseContactDraft(raw: string | null): ContactDraft {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return buildContactDraft(Object.entries(parsed));
  } catch {
    return {};
  }
}

function getStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function saveContactDraft(form: HTMLFormElement): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const draft = buildContactDraft(new FormData(form).entries());
    storage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage failure must never block form use.
  }
}

function restoreContactDraft(form: HTMLFormElement): void {
  const storage = getStorage();
  if (!storage) return;
  let draft: ContactDraft;
  try {
    draft = parseContactDraft(storage.getItem(STORAGE_KEY));
  } catch {
    return;
  }
  for (const element of Array.from(form.elements)) {
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) ||
      !element.name ||
      EXCLUDED_FIELDS.has(element.name)
    ) {
      continue;
    }
    if (
      element instanceof HTMLInputElement &&
      ["checkbox", "radio", "file"].includes(element.type)
    ) {
      continue;
    }
    if (Object.hasOwn(draft, element.name)) element.value = draft[element.name];
  }
}

export function connectContactDraft(form: HTMLFormElement): () => void {
  restoreContactDraft(form);
  const save = () => saveContactDraft(form);
  form.addEventListener("input", save);
  form.addEventListener("change", save);
  return () => {
    form.removeEventListener("input", save);
    form.removeEventListener("change", save);
  };
}

export function clearContactDraft(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage failure must never block the success state.
  }
}
```

- [ ] **Step 4: Run the unit tests and type-aware lint**

Run: `node --test tests/contact-draft.test.ts && npm run lint -- lib/contact-draft.ts tests/contact-draft.test.ts`

Expected: two passing tests and no lint errors.

- [ ] **Step 5: Commit the utility and tests**

```bash
git add lib/contact-draft.ts tests/contact-draft.test.ts
git commit -m "Preserve contact form drafts"
```

### Task 2: Form Integration and Mobile Usability

**Files:**
- Modify: `components/contact/ContactForm.tsx`
- Modify: `components/contact/StaticContactForm.tsx`
- Modify: `app/contact/page.tsx`
- Modify: `static-export/contact-page.tsx`

**Interfaces:**
- Consumes: `connectContactDraft(form: HTMLFormElement): () => void`
- Consumes: `clearContactDraft(): void`

- [ ] **Step 1: Connect both forms to the shared draft lifecycle**

In each form component, import `useEffect` and `useRef`, import the two draft functions, create `formRef`, connect it once, and clear after success:

```ts
const formRef = useRef<HTMLFormElement>(null);

useEffect(() => {
  if (!formRef.current) return;
  return connectContactDraft(formRef.current);
}, []);

useEffect(() => {
  if (status === "success") clearContactDraft();
}, [status]);
```

For `ContactForm`, use `state.status` in place of `status`. Add `ref={formRef}` to each `<form>`.

- [ ] **Step 2: Open the privacy policy safely without leaving the form**

Change both privacy links to:

```tsx
<Link
  href="/privacy-policy"
  target="_blank"
  rel="noopener noreferrer"
  className="text-brand underline underline-offset-2"
>
  プライバシーポリシー
</Link>
```

- [ ] **Step 3: Apply mobile form sizing to both form implementations**

Use the following shared class values in both files:

```ts
const fieldCls =
  "min-h-12 w-full rounded-card border border-[#d8d5d0] bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-[#8a8781] focus:border-brand aria-[invalid=true]:border-brand";
```

Use `text-sm leading-6` for labels, `h-5 w-5 shrink-0` for the checkbox, `min-h-11 py-2` for the checkbox label, and this submit button sizing:

```tsx
className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-card bg-brand px-9 py-[15px] text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60 min-[600px]:w-auto"
```

- [ ] **Step 4: Improve contact-page mobile spacing in both page variants**

Use `pb-20 pt-12 min-[720px]:pb-24 min-[720px]:pt-20` for the section, `gap-10` below desktop, `text-base leading-[1.9]` for the introduction, and `px-5 py-7 min-[600px]:px-8 min-[600px]:py-9` for the direct-contact card.

- [ ] **Step 5: Verify form behavior and build correctness**

Run: `node --test tests/contact-draft.test.ts && npm run lint && npm run build`

Expected: tests pass, lint reports no errors, and Next.js completes a production build.

- [ ] **Step 6: Commit the form integration**

```bash
git add components/contact/ContactForm.tsx components/contact/StaticContactForm.tsx app/contact/page.tsx static-export/contact-page.tsx
git commit -m "Improve contact form mobile UX"
```

### Task 3: Inquiry Route Cleanup

**Files:**
- Modify: `components/home/Hero.tsx`
- Modify: `components/home/PartnerSection.tsx`
- Modify: `components/layout/SiteFooter.tsx`
- Modify: `lib/site-config.ts`
- Modify: `app/about/page.tsx`
- Modify: `app/corporate-vision/page.tsx`
- Modify: `app/news/page.tsx`
- Modify: `app/business/it-solutions/page.tsx`
- Modify: `app/business/ai-solutions/page.tsx`

**Interfaces:**
- Preserves: global header desktop and mobile links to `/contact`
- Preserves: `components/home/ContactCta.tsx` as the home page's only in-content inquiry CTA

- [ ] **Step 1: Remove duplicate home-page inquiry buttons**

In `Hero.tsx`, keep only:

```tsx
<div className="hero-rise mt-10 [animation-delay:500ms]">
  <Button href="/#business">事業を見る</Button>
</div>
```

In `PartnerSection.tsx`, remove the `Button` import and button, and use:

```tsx
<FadeIn>
  <div>
    {/* existing kicker, heading, and paragraph */}
  </div>
</FadeIn>
```

- [ ] **Step 2: Remove footer and lower-page inquiry links**

Delete the `お問い合わせ` item from `footerNav`. Remove the news inquiry panel. Remove the contact button from the About and Corporate Vision paired CTA groups, retaining their recruitment and company-information buttons.

- [ ] **Step 3: Remove redundant business-page CTA sections**

Delete the final sections headed `開発体制のご相談、お気軽に。` and `AI活用のご相談、お気軽に。`. Keep each preceding `NextBusinessBand` so users can continue to the related service.

- [ ] **Step 4: Verify the intended contact-link inventory**

Run:

```bash
rg -n 'href="/contact"|href: "/contact"' app components lib -g '*.tsx' -g '*.ts'
```

Expected prominent routes: two links in `SiteHeader.tsx` and one in `ContactCta.tsx`. Functional references on the privacy-policy/contact pages may remain.

- [ ] **Step 5: Run complete verification**

Run: `node --test tests/contact-draft.test.ts && npm run lint && npm run build`

Expected: tests pass, lint reports no errors, and the production build succeeds.

- [ ] **Step 6: Commit the CTA cleanup**

```bash
git add components/home/Hero.tsx components/home/PartnerSection.tsx components/layout/SiteFooter.tsx lib/site-config.ts app/about/page.tsx app/corporate-vision/page.tsx app/news/page.tsx app/business/it-solutions/page.tsx app/business/ai-solutions/page.tsx
git commit -m "Simplify contact entry points"
```

### Task 4: Responsive Visual Verification

**Files:**
- Modify only files from Tasks 2–3 if visual defects are found

**Interfaces:**
- Verifies: `/`, `/contact`, `/privacy-policy`, `/business/it-solutions`, and `/business/ai-solutions`

- [ ] **Step 1: Start the local production server**

Run: `npm run build && npm run start`

Expected: Next.js listens locally without runtime errors.

- [ ] **Step 2: Check mobile layouts**

Capture `/` and `/contact` at widths 375px, 390px, and 430px. Confirm there is no horizontal scrolling, the form uses 16px inputs, the submit button fills the available width, and the privacy link opens a new tab without clearing entered values.

- [ ] **Step 3: Check tablet and desktop layouts**

Capture `/`, `/contact`, and both business pages at 768px, 1024px, and 1440px. Confirm the header inquiry button and home final contact section remain, while removed CTA blocks no longer leave excessive whitespace.

- [ ] **Step 4: Re-run verification after any visual correction**

Run: `node --test tests/contact-draft.test.ts && npm run lint && npm run build`

Expected: all checks succeed with no new warnings or errors.
