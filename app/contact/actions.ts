"use server";

import { z } from "zod";
import {
  contactCategories,
  type ContactField,
  type ContactFormState,
} from "@/lib/contact";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください"),
  company: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  tel: z.string().trim().optional(),
  category: z.enum(contactCategories, {
    message: "お問い合わせ種別を選択してください",
  }),
  message: z.string().trim().min(1, "お問い合わせ内容を入力してください"),
  privacy: z.literal("on", { message: "プライバシーポリシーへの同意が必要です" }),
});

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name") ?? "",
    company: formData.get("company") ?? "",
    email: formData.get("email") ?? "",
    tel: formData.get("tel") ?? "",
    category: formData.get("category") ?? "",
    message: formData.get("message") ?? "",
    privacy: formData.get("privacy") ?? "",
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      // schema のキー = ContactField であることを実行時に検証（アサーション不使用）
      if (typeof key === "string" && key in schema.shape) {
        const field = key as ContactField;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const data = parsed.data;
  const body = [
    `お名前: ${data.name}`,
    `会社名: ${data.company || "-"}`,
    `メール: ${data.email}`,
    `電話番号: ${data.tel || "-"}`,
    `種別: ${data.category}`,
    "",
    data.message,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;

  if (apiKey && to) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM ?? "JQIT Corporate <onboarding@resend.dev>",
        to,
        replyTo: data.email,
        subject: `【お問い合わせ】${data.category}｜${data.name}様`,
        text: body,
      });
      if (error) throw new Error(error.message);
    } catch (e) {
      console.error("[contact] メール送信に失敗:", e);
      return {
        status: "error",
        fieldErrors: {},
        formError:
          "送信に失敗しました。時間をおいて再度お試しいただくか、お電話にてご連絡ください。",
      };
    }
  } else if (process.env.NODE_ENV === "production") {
    // 本番でメール未接続は設定漏れ。PIIをログに残さず、送信できない旨をユーザーに明示する
    console.error(
      "[contact] RESEND_API_KEY/CONTACT_TO が未設定のため送信できません（内容は記録していません）",
    );
    return {
      status: "error",
      fieldErrors: {},
      formError: `現在フォームを利用できません。お手数ですが TEL ${siteConfig.tel}（${siteConfig.businessHours}）までご連絡ください。`,
    };
  } else {
    // 開発時のみ: サーバーログに記録
    console.log(`[contact] 新規お問い合わせ（メール未接続）\n${body}`);
  }

  return { status: "success", fieldErrors: {} };
}
