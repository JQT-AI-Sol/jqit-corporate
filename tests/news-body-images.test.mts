import assert from "node:assert/strict";
import test from "node:test";
import { prepareNewsBodyHtml } from "../lib/microcms.ts";

function imageSrc(html: string): string {
  const src = html.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1];
  assert.ok(src, "sanitized HTML should retain the image src");
  return src.replaceAll("&amp;", "&");
}

test("F-NEWS-IMG-01-01 adds WebP defaults to a microCMS JPEG", () => {
  const html = prepareNewsBodyHtml(
    '<p><img src="https://images.microcms-assets.io/assets/example/photo.jpg" alt="写真"></p>',
  );
  const url = new URL(imageSrc(html ?? ""));

  assert.equal(url.searchParams.get("fm"), "webp");
  assert.equal(url.searchParams.get("q"), "75");
  assert.equal(url.searchParams.get("w"), "1200");
});

test("F-NEWS-IMG-01-02 preserves existing query, quality, and width", () => {
  const html = prepareNewsBodyHtml(
    '<img src="https://images.microcms-assets.io/assets/example/photo.png?fit=crop&amp;q=82&amp;w=640">',
  );
  const url = new URL(imageSrc(html ?? ""));

  assert.equal(url.searchParams.get("fit"), "crop");
  assert.equal(url.searchParams.get("fm"), "webp");
  assert.equal(url.searchParams.get("q"), "82");
  assert.equal(url.searchParams.get("w"), "640");
});

test("F-NEWS-IMG-01-03 leaves GIF and SVG URLs unchanged", () => {
  for (const extension of ["gif", "svg"]) {
    const src = `https://images.microcms-assets.io/assets/example/image.${extension}`;
    const html = prepareNewsBodyHtml(`<img src="${src}">`);

    assert.equal(imageSrc(html ?? ""), src, `${extension} should not be converted`);
  }
});

test("F-NEWS-IMG-01-04 leaves external and relative image URLs unchanged", () => {
  for (const src of ["https://example.com/photo.jpg", "/news/photo.jpg"]) {
    const html = prepareNewsBodyHtml(`<img src="${src}">`);

    assert.equal(imageSrc(html ?? ""), src, `${src} should not be converted`);
  }
});

test("F-NEWS-IMG-01-05 keeps sanitization and safe external-link attributes", () => {
  const html = prepareNewsBodyHtml(
    '<script>alert(1)</script><a href="https://example.com" target="_blank">外部リンク</a>',
  );

  assert.doesNotMatch(html ?? "", /<script/i);
  assert.match(html ?? "", /rel="noopener noreferrer"/);
});
