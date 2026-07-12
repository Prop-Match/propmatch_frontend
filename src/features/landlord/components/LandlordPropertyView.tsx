"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useProperty } from "@/src/features/listings/hooks/useProperties";
import { PropertyDetailView } from "@/src/features/listings/components/PropertyDetailView";
import { StatusChip } from "@/src/components/ui/StatusChip";
import { Button } from "@/src/components/ui/Button";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import { useToast } from "@/src/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";

/** Landlord view of their own listing: status, rejection reason, boost CTA. */
export function LandlordPropertyView({ id }: { id: string }) {
  const { data: p } = useProperty(id);
  const [boostOpen, setBoostOpen] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();

  return (
    <div className="flex flex-col gap-4">
      {p && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-4">
          <div className="flex items-center gap-2">
            <StatusChip status={p.status} />
            {p.status === "rejected" && p.rejectionReason && (
              <span className="text-small text-error">سبب الرفض: {p.rejectionReason}</span>
            )}
          </div>
          {p.status === "approved" && !p.boosted && (
            <Button size="sm" onClick={() => setBoostOpen(true)}>
              <TrendingUp className="size-4" aria-hidden />
              تمييز الإعلان
            </Button>
          )}
          {p.boosted && (
            <span className="rounded-pill bg-pending-tint px-3 py-1 text-caption font-bold text-pending">إعلان مميّز</span>
          )}
        </div>
      )}

      <PropertyDetailView id={id} hideContact />

      <PaymentSheet
        open={boostOpen}
        onClose={() => setBoostOpen(false)}
        context="boost"
        propertyId={id}
        onActivated={() => {
          toast("success", "تم تمييز إعلانك");
          qc.invalidateQueries({ queryKey: ["properties", id] });
          setBoostOpen(false);
        }}
      />
    </div>
  );
}
