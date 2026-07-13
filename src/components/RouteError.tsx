"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

/**
 * Reusable route-group error boundary UI. Each `error.tsx` renders this so
 * an uncaught render/data error shows a friendly Arabic screen instead of
 * Next's raw overlay. `reset` re-renders the segment.
 */
export function RouteError({ reset, homeHref = "/" }: { reset: () => void; homeHref?: string }) {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-error-tint text-error">
        <AlertTriangle className="size-8" aria-hidden />
      </span>
      <h1 className="text-h2 font-bold text-ink">حدث خطأ غير متوقع</h1>
      <p className="max-w-sm text-small text-muted">
        نعتذر، حدثت مشكلة أثناء تحميل هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="size-4" aria-hidden />
          إعادة المحاولة
        </Button>
        <Link href={homeHref}>
          <Button variant="secondary">
            <Home className="size-4" aria-hidden />
            الرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
