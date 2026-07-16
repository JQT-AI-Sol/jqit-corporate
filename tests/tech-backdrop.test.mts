import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("shared page headers do not render decorative vertical rules", () => {
  const source = readFileSync("components/ui/TechBackdrop.tsx", "utf8");

  assert.doesNotMatch(source, /right-\[18%\]|right-\[9%\]|垂直罫線/);
  assert.match(source, /tech-dots/);
  assert.match(source, /tech-scan/);
});
