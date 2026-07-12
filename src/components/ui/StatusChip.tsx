import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/src/utils/cn";
import type { ListingStatus } from "@/src/lib/api/contracts/common";

const statusConfig: Record<ListingStatus, { label: string; className: string; Icon: typeof Clock | null }> = {
  draft: { label: "مسودة", className: "bg-background text-muted border-hairline", Icon: null },
  pending: { label: "قيد المراجعة", className: "bg-pending-tint text-pending border-pending/30", Icon: Clock },
  approved: { label: "تمت الموافقة", className: "bg-success-tint text-success border-success/30", Icon: CheckCircle2 },
  rejected: { label: "مرفوض", className: "bg-error-tint text-error border-error/30", Icon: XCircle },
};

export function StatusChip({ status, className }: { status: ListingStatus; className?: string }) {
  const { label, className: statusClass, Icon } = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-caption font-semibold",
        statusClass,
        className,
      )}
    >
      {Icon && <Icon className="size-3" aria-hidden />}
      {label}
    </span>
  );
}
