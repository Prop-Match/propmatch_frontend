import { SignupForm } from "@/src/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-h1 font-bold text-ink">إنشاء حساب</h2>
        <p className="mt-1 text-small text-muted">ابدأ رحلتك مع PropMatch AI</p>
      </div>
      <SignupForm />
    </div>
  );
}
