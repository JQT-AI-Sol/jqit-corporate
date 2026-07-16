import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const formFiles = [
  "components/contact/ContactForm.tsx",
  "components/contact/StaticContactForm.tsx",
];

for (const file of formFiles) {
  test(`${file} preserves drafts and keeps mobile controls usable`, () => {
    const source = readFileSync(file, "utf8");

    assert.match(source, /connectContactDraft/);
    assert.match(source, /clearContactDraft/);
    assert.match(source, /ref=\{formRef\}/);
    assert.match(source, /target="_blank"/);
    assert.match(source, /text-base/);
    assert.match(source, /min-h-12/);
    assert.match(source, /min-\[600px\]:w-auto/);
  });
}
