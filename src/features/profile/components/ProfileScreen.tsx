"use client";

import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Phone, LogOut, Search, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSession, useLogout } from "@/src/features/auth/hooks/useSession";
import { VerifiedBadge } from "@/src/components/ui/VerifiedBadge";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useSessionUiStore } from "@/src/lib/store/useSessionUiStore";
import { cn } from "@/src/utils/cn";

export function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useSession();
  const logout = useLogout();
  const { activeRoleContext, setActiveRoleContext } = useSessionUiStore();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!user) {
    router.push("/login");
    return null;
  }

  const isDual = user.role === "both";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-h1 font-bold text-ink">حسابي</h1>

      <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary">
            <UserIcon className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-title font-bold text-ink">{user.fullName}</p>
            <VerifiedBadge status={user.verificationStatus} />
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-hairline pt-3 text-small text-body-text">
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-muted" aria-hidden />
            {user.email}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-muted" aria-hidden />
            {user.phone}
          </p>
        </div>
      </div>

      {/* Verification CTA for landlords/dual */}
      {user.verificationStatus !== "verified" && user.role !== "tenant" && (
        <Link href="/landlord/verify" className="flex items-center gap-3 rounded-card border border-pending/30 bg-pending-tint px-4 py-3">
          <ShieldAlert className="size-5 text-pending" aria-hidden />
          <span className="flex-1 text-small font-semibold text-pending">وثّق هويتك لنشر إعلاناتك</span>
          <span className="text-small text-pending">←</span>
        </Link>
      )}

      {/* Dual-role mode switch */}
      {isDual && (
        <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-5">
          <p className="text-small font-semibold text-ink">تبديل العرض</p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { mode: "tenant", label: "مستأجر", Icon: Search, href: "/tenant" },
                { mode: "landlord", label: "مالك", Icon: Home, href: "/landlord" },
              ] as const
            ).map(({ mode, label, Icon, href }) => (
              <button
                key={mode}
                onClick={() => {
                  setActiveRoleContext(mode);
                  router.push(href);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-card border p-4 transition-colors",
                  activeRoleContext === mode ? "border-primary bg-primary-tint" : "border-hairline hover:border-primary/40",
                )}
              >
                <Icon className={cn("size-6", activeRoleContext === mode ? "text-primary" : "text-muted")} aria-hidden />
                <span className="text-small font-bold text-ink">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button variant="danger" onClick={() => logout.mutate()} loading={logout.isPending}>
        <LogOut className="size-4" aria-hidden />
        تسجيل الخروج
      </Button>
    </div>
  );
}
