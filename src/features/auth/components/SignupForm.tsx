"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Home, Users } from "lucide-react";
import { useRegister } from "../hooks/useSession";
import { signupFormSchema, type SignupForm as SignupFormValues } from "../validation/schemas";
import { InputField } from "@/src/components/ui/Field";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/utils/cn";
import { isApiClientError } from "@/src/lib/api/browserClient";
import { landingAfterLogin } from "../roleRouting";
import type { SignupRole, AuthResponse } from "@/src/lib/api/contracts/auth";

const roleOptions: { value: SignupRole; title: string; subtitle: string; Icon: typeof Search }[] = [
  { value: "tenant", title: "مستأجر", subtitle: "أبحث عن سكن", Icon: Search },
  { value: "landlord", title: "مالك", subtitle: "أعرض عقاري", Icon: Home },
  { value: "both", title: "الاثنين", subtitle: "أبحث وأعرض", Icon: Users },
];

export function SignupForm() {
  const router = useRouter();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { role: "tenant" },
  });

  async function onSubmit(values: SignupFormValues) {
    try {
      const res = (await registerUser.mutateAsync(values)) as AuthResponse;
      router.push(landingAfterLogin(res.user.role));
    } catch (e) {
      const message = isApiClientError(e) ? e.message : "تعذر إنشاء الحساب، حاول مرة أخرى";
      setError("root", { message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <InputField label="الاسم بالكامل" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <InputField
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        placeholder="example@mail.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <InputField
        label="رقم الهاتف"
        type="tel"
        inputMode="numeric"
        placeholder="01xxxxxxxxx"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <InputField
        label="كلمة المرور"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-small font-semibold text-ink">اختر نوع حسابك</span>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map(({ value, title, subtitle, Icon }) => {
                const selected = field.value === value;
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => field.onChange(value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-card border p-3 text-center transition-colors",
                      selected
                        ? "border-primary bg-primary-tint"
                        : "border-hairline bg-surface hover:border-primary/40",
                    )}
                  >
                    <Icon className={cn("size-5", selected ? "text-primary" : "text-muted")} aria-hidden />
                    <span className="text-small font-bold text-ink">{title}</span>
                    <span className="text-caption text-muted">{subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      />

      {errors.root && (
        <p className="rounded-control bg-error-tint px-3 py-2 text-small text-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" block loading={isSubmitting} size="lg">
        إنشاء حساب
      </Button>
      <p className="text-center text-small text-muted">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
