import { Skeleton } from "@/src/components/ui/Skeleton";

export default function SharedLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
