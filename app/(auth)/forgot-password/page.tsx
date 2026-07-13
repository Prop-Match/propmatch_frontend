import { ForgotPasswordForm } from "@/src/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-h1 font-bold text-ink">إعادة تعيين كلمة المرور</h2>
        <p className="mt-1 text-small text-muted">أدخل بريدك وسنرسل لك رابط الاستعادة</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
