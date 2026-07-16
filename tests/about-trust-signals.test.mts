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
