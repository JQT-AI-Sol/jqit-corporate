/**
 * 静的エクスポート（GitHub Pages）用の next/image ローダー。
 * next/image は basePath を src に付与しないため、ここで補う。
 * basePath は next.config.ts と同期を保つこと。
 */
const basePath = "/jqit-corporate";

export default function staticImageLoader({ src }: { src: string }): string {
  return src.startsWith("/") ? `${basePath}${src}` : src;
}
