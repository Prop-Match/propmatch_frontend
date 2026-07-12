"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useApprovedProperties } from "../hooks/useProperties";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyCardSkeleton } from "@/src/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/src/components/ui/States";

export function TenantBrowse() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useApprovedProperties(search);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(input.trim());
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">تصفّح العقارات</h1>
        <p className="mt-1 text-small text-muted">إعلانات موثّقة من ملّاك مباشرة في المنصورة.</p>
      </div>

      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute top-1/2 start-3 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ابحث بالحي أو نوع العقار…"
          className="w-full rounded-control border border-hairline bg-surface py-2.5 ps-10 pe-3 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </form>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="لا توجد عقارات مطابقة" description="جرّب كلمات بحث مختلفة أو تصفّح كل الإعلانات." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => router.push(`/tenant/properties/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
