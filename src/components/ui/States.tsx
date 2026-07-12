import { SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  action,
  Icon = SearchX,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  Icon?: typeof SearchX;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-hairline bg-surface px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="text-title font-bold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-small text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-error/20 bg-error-tint/40 px-6 py-10 text-center" role="alert">
      <span className="flex size-12 items-center justify-center rounded-full bg-error-tint text-error">
        <AlertCircle className="size-6" aria-hidden />
      </span>
      <p className="text-body font-semibold text-ink">حدث خطأ ما</p>
      <p className="max-w-sm text-small text-muted">{message ?? "تعذر تحميل البيانات، حاول مرة أخرى."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
