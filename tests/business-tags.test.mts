import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("home IT solutions uses the three customer-facing service categories", () => {
  const source = readFileSync("components/home/BusinessSection.tsx", "utf8");
  const itSolutions = source.match(
    /title: "ITソリューション事業"[\s\S]*?tags: \[([^\]]+)\]/,
  )?.[1];

  assert.ok(itSolutions);
  assert.match(itSolutions, /^"開発", "インフラ", "QA"$/);
  assert.doesNotMatch(itSolutions, /受託開発|SES|第三者検証/);
});

test("IT solutions page describes SES as team-based technical support", () => {
  const source = readFileSync("app/business/it-solutions/page.tsx", "utf8");

  assert.match(source, /チーム体制にて技術支援/);
  assert.doesNotMatch(source, /労働者派遣事業 派13-318536/);
});
