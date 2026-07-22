"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useApprovedProperties, useSemanticPropertySearch } from "../hooks/useProperties";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyCardSkeleton } from "@/src/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/src/components/ui/States";
import { Button } from "@/src/components/ui/Button";
import { formatNumber } from "@/src/utils/format";
import type { PropertySearchQuery } from "@/src/lib/api/contracts/property";
import { FavoriteButton } from "./FavoriteButton";
import { SearchFilters } from "./SearchFilters";

const semanticSearchLimit = 10;

export function TenantBrowse() {
  const router = useRouter();
  const [semanticInput, setSemanticInput] = useState("");
  const [semanticQuery, setSemanticQuery] = useState<string | null>(null);
  const [semanticValidation, setSemanticValidation] = useState<string | null>(null);
  const [query, setQuery] = useState<PropertySearchQuery>({});
  const normalBrowse = useApprovedProperties(query);
  const semanticSearch = useSemanticPropertySearch(semanticQuery, semanticSearchLimit);
  const isSemanticMode = semanticQuery !== null;
  const activeSearch = isSemanticMode ? semanticSearch : normalBrowse;

  function submitSemanticSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = semanticInput.trim();

    if (trimmed.length < 2) {
      setSemanticValidation("اكتب حرفين على الأقل للبحث.");
      return;
    }
    if (trimmed.length > 300) {
      setSemanticValidation("يجب ألا يتجاوز وصف البحث 300 حرف.");
      return;
    }

    setSemanticValidation(null);
    setSemanticQuery(trimmed);
  }

  function clearSemanticSearch() {
    setSemanticInput("");
    setSemanticQuery(null);
    setSemanticValidation(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">تصفّح العقارات</h1>
        <p className="mt-1 text-small text-muted">إعلانات موثّقة من ملّاك مباشرة في المنصورة.</p>
      </div>

      <form
        onSubmit={submitSemanticSearch}
        className="rounded-card border border-hairline bg-surface p-4"
      >
        <h2 className="text-title font-bold text-ink">ابحث بوصف العقار الذي تحتاجه</h2>
        <p className="mt-1 text-small text-muted">
          اكتب وصفًا طبيعيًا لمواصفات السكن، وسنعرض لك العقارات الأقرب لاحتياجاتك.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 start-3 size-5 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              value={semanticInput}
              onChange={(e) => {
                setSemanticInput(e.target.value);
                if (semanticValidation) setSemanticValidation(null);
              }}
              placeholder="مثال: شقة هادئة غرفتين قريبة من الجامعة وبميزانية متوسطة"
              aria-label="ابحث بوصف العقار الذي تحتاجه"
              aria-describedby={semanticValidation ? "semantic-search-validation" : undefined}
              className="w-full rounded-control border border-hairline bg-surface py-2.5 ps-10 pe-3 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" loading={semanticSearch.isFetching}>
            بحث ذكي
          </Button>
          {isSemanticMode && (
            <Button type="button" variant="ghost" onClick={clearSemanticSearch}>
              مسح البحث
            </Button>
          )}
        </div>
        {semanticValidation && (
          <p id="semantic-search-validation" className="mt-2 text-small text-error" role="alert">
            {semanticValidation}
          </p>
        )}
      </form>

      <SearchFilters value={query} onChange={setQuery} />

      {isSemanticMode && (
        <p className="text-small font-semibold text-primary">
          نتائج البحث الذكي عن: “{semanticQuery}”
        </p>
      )}

      {activeSearch.isError ? (
        isSemanticMode ? (
          <EmptyState
            title="البحث الذكي غير متاح مؤقتًا. حاول مرة أخرى بعد قليل."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={() => semanticSearch.refetch()}>
                  إعادة المحاولة
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSemanticSearch}>
                  العودة للتصفح العادي
                </Button>
              </div>
            }
          />
        ) : (
          <ErrorState onRetry={() => normalBrowse.refetch()} />
        )
      ) : activeSearch.isLoading ? (
        <>
          {isSemanticMode && (
            <p className="text-small text-muted">جارٍ البحث عن العقارات الأقرب لاحتياجاتك...</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : !activeSearch.data || activeSearch.data.items.length === 0 ? (
        isSemanticMode ? (
          <EmptyState
            title="لم نجد عقارات مطابقة لوصفك حاليًا."
            description="جرّب تعديل الوصف أو استخدام مواصفات أكثر عمومية."
            action={
              <Button size="sm" variant="ghost" onClick={clearSemanticSearch}>
                مسح البحث
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="لا توجد عقارات مطابقة"
            description="جرّب كلمات بحث مختلفة أو وسّع نطاق التصفية."
          />
        )
      ) : (
        <>
          <p className="text-caption text-muted">{formatNumber(activeSearch.data.total)} عقار</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSearch.data.items.map((property) => (
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
