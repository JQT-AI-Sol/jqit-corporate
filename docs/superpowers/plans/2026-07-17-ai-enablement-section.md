# AI Enablement Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AIソリューション事業ページのNOVA直下に、AI導入伴走支援を同じ重要度で紹介し、専用サイトへ誘導する独立セクションを追加する。

**Architecture:** 既存の `app/business/ai-solutions/page.tsx` に、NOVAと対になるライトトーンのセクションを追加する。データや新規コンポーネントは増やさず、既存の `Image`、`Container`、`FadeIn`、`Button`、`siteConfig.links.aiSupport` を再利用する。

**Tech Stack:** Next.js 16、React、TypeScript、Tailwind CSS v4、Node.js標準テストランナー

## Global Constraints

- 配置はNOVAセクション直下、`NextBusinessBand` の直前とする。
- PCでは画像を左、説明を右に置き、NOVAと左右を反転させる。
- スマートフォンでは画像、説明、支援ステップ、CTAの順に1カラム表示する。
- 支援ステップは「業務の棚卸し・導入設計」「既存アプリを活かしたAIエージェント導入」「運用定着・内製化支援」の3つとする。
- CTAは `AI導入伴走支援を見る`、遷移先は `siteConfig.links.aiSupport` とする。
- 画像は `/business-ai.png` を使用する。
- 問い合わせ導線は追加しない。
- 外部リンクの安全な属性、キーボードフォーカス、48px以上のタップ領域を維持する。

---

### Task 1: AI導入伴走支援セクション

**Files:**
- Create: `tests/ai-enablement-section.test.mts`
- Modify: `app/business/ai-solutions/page.tsx`

**Interfaces:**
- Consumes: `siteConfig.links.aiSupport: string`、`Button` の `external` プロパティ、既存画像 `/business-ai.png`
- Produces: NOVA直下に表示されるAI導入伴走支援セクションと、専用サイトへの外部リンク

- [ ] **Step 1: 失敗する回帰テストを作成する**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("AI solutions page presents enablement support directly after NOVA", () => {
  const source = readFileSync("app/business/ai-solutions/page.tsx", "utf8");
  const novaIndex = source.indexOf("{/* NOVA — 自社プロダクト */}");
  const enablementIndex = source.indexOf("{/* AI ENABLEMENT — 導入伴走支援 */}");
  const nextIndex = source.indexOf("{/* NEXT — ITソリューション事業へ */}");

  assert.ok(novaIndex >= 0);
  assert.ok(enablementIndex > novaIndex);
  assert.ok(nextIndex > enablementIndex);
  assert.match(source, /AI導入伴走支援/);
  assert.match(source, /3か月で伴走/);
  assert.match(source, /業務の棚卸し・導入設計/);
  assert.match(source, /既存アプリを活かしたAIエージェント導入/);
  assert.match(source, /運用定着・内製化支援/);
  assert.match(source, /src="\/business-ai\.png"/);
  assert.match(source, /href=\{siteConfig\.links\.aiSupport\}/);
  assert.match(source, /AI導入伴走支援を見る/);
});
```

- [ ] **Step 2: テストが期待どおり失敗することを確認する**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/ai-enablement-section.test.mts`

Expected: `enablementIndex > novaIndex` または「AI導入伴走支援」のアサーションでFAIL

- [ ] **Step 3: NOVA直下にライトトーンの独立セクションを追加する**

`app/business/ai-solutions/page.tsx` のNOVAセクション終了後、`NextBusinessBand` の前に次の構造を追加する。

```tsx
      {/* AI ENABLEMENT — 導入伴走支援 */}
      <section className="relative overflow-hidden border-t border-line bg-cream py-20 min-[720px]:py-[100px]">
        <div className="pointer-events-none absolute -bottom-2 left-0 min-[720px]:-bottom-4">
          <DisplayText>ENABLEMENT</DisplayText>
        </div>
        <Container className="relative">
          <div className="grid grid-cols-1 items-center gap-12 min-[1024px]:grid-cols-[1fr_1fr] min-[1024px]:gap-16">
            <FadeIn>
              <Image
                src="/business-ai.png"
                alt="業務に合わせたAIエージェント導入について相談する担当者"
                width={1536}
                height={1365}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full rounded-xl object-cover"
              />
            </FadeIn>
            <FadeIn>
              <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
                <span aria-hidden className="h-px w-6 bg-brand" />
                AI Enablement
              </p>
              <h2 className="palt text-[28px] font-bold leading-[1.45] tracking-[-0.02em] text-ink min-[720px]:text-[36px]">
                既存アプリを活かし、
                <br />
                AIエージェント導入を3か月で伴走。
              </h2>
              <p className="mt-6 text-[14.5px] leading-[2.05] text-body">
                現場の業務を棚卸しし、いま使っている業務アプリを活かしながら、AIエージェントの設計・導入・運用定着まで支援します。導入後も現場が改善を続けられる内製化体制をつくります。
              </p>
              <ol className="mt-8 border-t border-line">
                {[
                  "業務の棚卸し・導入設計",
                  "既存アプリを活かしたAIエージェント導入",
                  "運用定着・内製化支援",
                ].map((step, index) => (
                  <li key={step} className="flex items-center gap-4 border-b border-line py-4">
                    <span className="font-mono text-[10px] text-brand">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="palt text-[14px] font-bold text-ink">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-9">
                <Button href={siteConfig.links.aiSupport} external>
                  AI導入伴走支援を見る
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
```

- [ ] **Step 4: 対象テストが通ることを確認する**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/ai-enablement-section.test.mts`

Expected: 1 test passed

- [ ] **Step 5: 自動検証を実行する**

Run: `npm run lint -- app/business/ai-solutions/page.tsx tests/ai-enablement-section.test.mts`

Expected: lint error 0件

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/*.test.mts`

Expected: 全テストPASS

Run: `npm run build`

Expected: Next.js production build成功

- [ ] **Step 6: PCとスマートフォンの実画面を確認する**

`http://localhost:3000/business/ai-solutions` を再読み込みし、PC幅で画像左・説明右になっていること、NOVAと同程度の視覚的な強さがあること、CTAが専用サイトを指すことを確認する。次にスマートフォン幅で画像→説明→3ステップ→CTAの順に表示され、見出しやステップが不自然に折り返さず、CTAが押しやすいことを確認する。

- [ ] **Step 7: 実装をコミットする**

```bash
git add app/business/ai-solutions/page.tsx tests/ai-enablement-section.test.mts
git commit -m "Add AI enablement service section"
```
