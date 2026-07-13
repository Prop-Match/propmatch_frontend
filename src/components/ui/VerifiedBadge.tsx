import { BadgeCheck, Clock, ShieldQuestion, XCircle } from "lucide-react";
import { cn } from "@/src/utils/cn";
import type { VerificationStatus } from "@/src/lib/api/contracts/auth";

const config: Record<
  VerificationStatus,
  { label: string; className: string; Icon: typeof BadgeCheck }
> = {
  verified: { label: "مالك موثّق الهوية", className: "bg-success-tint text-success", Icon: BadgeCheck },
  pending_review: { label: "التحقق قيد المراجعة", className: "bg-pending-tint text-pending", Icon: Clock },
  unverified: { label: "غير موثّق", className: "bg-background text-muted", Icon: ShieldQuestion },
  rejected: { label: "التحقق مرفوض", className: "bg-error-tint text-error", Icon: XCircle },
};

export function VerifiedBadge({
  status,
  compact,
  className,
}: {
  status: VerificationStatus;
  compact?: boolean;
  className?: string;
}) {
  const { label, className: statusClass, Icon } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-caption font-semibold",
        statusClass,
        className,
      )}
      title={label}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {!compact && label}
    </span>
  );
}

/**
 * The honest-trust rule (design spec §6): a verified badge must never appear
 * without this disclaimer nearby. Render it on eKYC screens, listing detail,
 * and landlord onboarding.
 */
export function OwnershipDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-control bg-trust-blue-tint px-3.5 py-2.5 text-caption leading-relaxed text-body-text", className)}>
      يتم التحقق من هوية المستخدم فقط، أما ملكية العقار فيُقرّ بها المالك على مسؤوليته.
    </p>
  );
}
