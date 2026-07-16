import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContactDraft,
  clearContactDraft,
  parseContactDraft,
} from "../lib/contact-draft.ts";

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

test("clearContactDraft removes the session draft", () => {
  const removedKeys: string[] = [];
  clearContactDraft({
    removeItem(key: string) {
      removedKeys.push(key);
    },
  });

  assert.deepEqual(removedKeys, ["jqit:contact-draft:v1"]);
});
