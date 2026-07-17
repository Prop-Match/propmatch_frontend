"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useApprovedProperties } from "../hooks/useProperties";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyCardSkeleton } from "@/src/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/src/components/ui/States";
import { formatNumber } from "@/src/utils/format";
import type { PropertySearchQuery } from "@/src/lib/api/contracts/property";
import { FavoriteButton } from "./FavoriteButton";
import { SearchFilters } from "./SearchFilters";

/**
 * PRO-11 hybrid search: the free-text box is the semantic half (ChromaDB on
 * the backend), `SearchFilters` the hard-SQL half. Ranking is
 * server-authoritative — never re-sort here.
 */
export function TenantBrowse() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const { data, isLoading, isError, refetch } = useApprovedProperties(query);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setQuery((q) => ({ ...q, q: input.trim() || undefined }));
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
          aria-label="ابحث"
          className="w-full rounded-control border border-hairline bg-surface py-2.5 ps-10 pe-3 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </form>

      <SearchFilters value={query} onChange={setQuery} />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="لا توجد عقارات مطابقة" description="جرّب كلمات بحث مختلفة أو وسّع نطاق التصفية." />
      ) : (
        <>
          <p className="text-caption text-muted">{formatNumber(data.total)} عقار</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => router.push(`/tenant/properties/${property.id}`)}
                actionSlot={<FavoriteButton propertyId={property.id} />}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
