import { Sparkles } from "lucide-react";
import { cn } from "@/src/utils/cn";
import { formatNumber } from "@/src/utils/format";

export interface QuotaChipProps {
  remaining: number;
  /** e.g. «محاولات المطابقة المجانية المتبقية» or «الاستخدامات المجانية المتبقية» */
  label: string;
  className?: string;
}

/** has-quota (teal) → low (amber, ≤1) → exhausted (red, 0). */
export function QuotaChip({ remaining, label, className }: QuotaChipProps) {
  const tone =
    remaining === 0
      ? "bg-error-tint text-error"
      : remaining <= 1
        ? "bg-pending-tint text-pending"
        : "bg-primary-tint text-primary-dark";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-caption font-semibold",
        tone,
        className,
      )}
    >
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      {remaining === 0 ? "انتهت محاولاتك المجانية" : `${label}: ${formatNumber(remaining)}`}
    </span>
  );
}
