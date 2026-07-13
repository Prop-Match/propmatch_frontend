"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { InputField } from "@/src/components/ui/Field";
import { Button } from "@/src/components/ui/Button";
import { api } from "@/src/lib/api/browserClient";

const schema = z.object({ email: z.string().email("بريد إلكتروني غير صالح") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    // Neutral outcome either way — never reveals whether the email exists.
    await api.post("auth/forgot-password", values).catch(() => undefined);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-tint text-success">
          <MailCheck className="size-7" aria-hidden />
        </span>
        <h2 className="text-h2 font-bold text-ink">تحقق من بريدك</h2>
        <p className="max-w-sm text-small text-muted">
          إذا كان هذا البريد مسجّلًا لدينا، فستصلك رسالة بها رابط لإعادة تعيين كلمة المرور.
        </p>
        <Link href="/login" className="text-small font-semibold text-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <InputField
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        placeholder="example@mail.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" block loading={isSubmitting} size="lg">
        إرسال رابط إعادة التعيين
      </Button>
      <p className="text-center text-small text-muted">
        تذكّرت كلمة المرور؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
