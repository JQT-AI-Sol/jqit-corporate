import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1: GitHub Pages 向け静的エクスポート。
 * basePath はリポジトリ名（https://<owner>.github.io/jqit-corporate/）に一致させる。
 * lib/static-image-loader.ts の basePath と同期を保つこと。
 * 通常ビルド（Vercel等・ローカル）は Server Actions / ISR をそのまま使う。
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: "/jqit-corporate",
      trailingSlash: true,
      images: {
        loader: "custom",
        loaderFile: "./lib/static-image-loader.ts",
        remotePatterns: [
          {
            protocol: "https",
            hostname: "images.microcms-assets.io",
          },
        ],
      },
    }
  : {
      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "images.microcms-assets.io",
          },
        ],
      },
    };

export default nextConfig;
