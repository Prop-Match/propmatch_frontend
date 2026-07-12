import { cn } from "@/src/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-control bg-hairline", className)} aria-hidden />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
