import Image from "next/image";
import { certificationBadges } from "@/lib/site-config";

/** ヒーロー直下の信頼バー: 認証・許認可・アワードを公式ロゴで提示 */
export function TrustBar() {
  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center justify-start gap-x-10 gap-y-3 px-6 py-4 min-[720px]:justify-between">
        {certificationBadges.map((c) =>
          c.image ? (
            <Image
              key={c.label}
              src={c.image.src}
              alt={c.label}
              width={c.image.width}
              height={c.image.height}
              className="h-8 w-auto opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span
              key={c.label}
              className="inline-flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.1em] text-muted"
            >
              <span aria-hidden className="h-1 w-1 bg-brand" />
              {c.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
