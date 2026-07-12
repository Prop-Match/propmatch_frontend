import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireSession } from "@/src/lib/api/serverSession";

/** Shared authenticated surfaces (contract generator) available to any role. */
export default async function SharedLayout({ children }: { children: React.ReactNode }) {
  await requireSession("/contracts/new");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-h2 font-bold text-primary">
            PropMatch AI
          </Link>
          <Link href="/tenant" className="flex items-center gap-1 text-small text-muted hover:text-ink">
            <ArrowRight className="size-4" aria-hidden />
            رجوع
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
