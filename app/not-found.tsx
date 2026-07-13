import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Compass className="size-8" aria-hidden />
      </span>
      <h1 className="text-display font-bold text-ink">٤٠٤</h1>
      <p className="text-title font-semibold text-ink">الصفحة غير موجودة</p>
      <p className="max-w-sm text-small text-muted">قد يكون الرابط قديمًا أو تم نقل الصفحة.</p>
      <Link href="/">
        <Button>العودة للرئيسية</Button>
      </Link>
    </div>
  );
}
