import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { TechBackdrop } from "@/components/ui/TechBackdrop";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-cream py-28 min-[720px]:py-36">
      <TechBackdrop />
      <div className="relative mx-auto w-full max-w-[1160px] px-6 text-center">
        <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.24em] text-brand">
          404 Not Found
        </p>
        <h1 className="palt mt-5 text-[30px] font-bold tracking-[-0.02em] text-ink min-[720px]:text-[42px]">
          お探しのページが見つかりません。
        </h1>
        <p className="mx-auto mt-6 max-w-[480px] text-[15px] leading-[2.05] text-body">
          URLが変更されたか、ページが削除された可能性があります。お手数ですが、トップページからお探しください。
        </p>
        <div className="mt-9 flex justify-center">
          <Button href="/">トップページへ戻る</Button>
        </div>
      </div>
    </section>
  );
}
