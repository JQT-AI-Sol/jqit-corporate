import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const filesWithoutContactRoutes = [
  "components/home/Hero.tsx",
  "components/home/PartnerSection.tsx",
  "components/layout/SiteFooter.tsx",
  "lib/site-config.ts",
  "app/about/page.tsx",
  "app/corporate-vision/page.tsx",
  "app/news/page.tsx",
  "app/business/it-solutions/page.tsx",
  "app/business/ai-solutions/page.tsx",
];

for (const file of filesWithoutContactRoutes) {
  test(`${file} does not add a duplicate contact route`, () => {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /(?:href=["']\/contact|href:\s*["']\/contact)/);
  });
}

test("the global header retains desktop and mobile contact routes", () => {
  const source = readFileSync("components/layout/SiteHeader.tsx", "utf8");
  assert.equal(source.match(/href="\/contact"/g)?.length, 2);
});

test("the home page final section retains one contact route", () => {
  const source = readFileSync("components/home/ContactCta.tsx", "utf8");
  assert.equal(source.match(/href="\/contact"/g)?.length, 1);
});
