"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, SearchX } from "lucide-react";
import { MatchIntakeForm } from "./MatchIntakeForm";
import { useMatchQuota, useRunMatch } from "../hooks/useMatch";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyCardSkeleton } from "@/src/components/ui/Skeleton";
import { QuotaChip } from "@/src/components/ui/QuotaChip";
import { EmptyState } from "@/src/components/ui/States";
import { Button } from "@/src/components/ui/Button";
import type { MatchResponse } from "@/src/lib/api/contracts/match";
import type { MatchIntakeForm as MatchIntakeFormValues } from "../validation/schemas";

export function MatchFlow() {
  const router = useRouter();
  const qc = useQueryClient();
  const quota = useMatchQuota();
  const runMatch = useRunMatch();
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  function submit(values: MatchIntakeFormValues) {
    runMatch.mutate(values, {
      onSuccess: (data) => {
        setResults(data);
        qc.setQueryData(["match", "quota"], { remaining: data.remainingFreeMatches });
      },
      onError: (err) => {
        if (err.quotaExhausted) setPaywallOpen(true);
      },
    });
  }

  const remaining = quota.data?.remaining ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-h1 font-bold text-ink">
            <Sparkles className="size-6 text-primary" aria-hidden />
            المطابقة الذكية
          </h1>
          <p className="mt-1 text-small text-muted">أخبرنا عمّا تبحث عنه ودعنا نجد سكنك المثالي.</p>
        </div>
        {quota.data && <QuotaChip remaining={remaining} label="محاولات المطابقة المجانية المتبقية" />}
      </div>

      {runMatch.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!runMatch.isPending && results && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title font-bold text-ink">نتائج المطابقة</h2>
            <Button variant="ghost" size="sm" onClick={() => setResults(null)}>
              بحث جديد
            </Button>
          </div>
          {results.results.length === 0 ? (
            <EmptyState
              Icon={SearchX}
              title="لا توجد نتائج مطابقة"
              description="جرّب توسيع نطاق ميزانيتك أو اختيار مناطق إضافية."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.results.map(({ property, matchScore }) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  matchScore={matchScore}
                  onClick={() => router.push(`/tenant/properties/${property.id}?score=${matchScore}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {!results && !runMatch.isPending && <MatchIntakeForm onSubmit={submit} submitting={runMatch.isPending} />}

      <PaymentSheet
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        context="matchmaker-refill"
        onActivated={() => {
          setPaywallOpen(false);
          quota.refetch();
        }}
      />
    </div>
  );
}
