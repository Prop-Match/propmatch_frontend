import { Suspense } from "react";
import { LoginForm } from "@/src/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-h1 font-bold text-ink">تسجيل الدخول</h2>
        <p className="mt-1 text-small text-muted">أهلًا بعودتك</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
