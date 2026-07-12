"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { useProperty } from "@/src/features/listings/hooks/useProperties";
import { PropertyDetailView } from "@/src/features/listings/components/PropertyDetailView";
import { useReviewProperty } from "../hooks/useAdmin";
import { Button } from "@/src/components/ui/Button";
import { TextAreaField } from "@/src/components/ui/Field";
import { useToast } from "@/src/components/ui/Toast";

export function AdminPropertyReview({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: p } = useProperty(id);
  const review = useReviewProperty(id);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function decide(decision: "approve" | "reject") {
    review.mutate(
      { decision: { decision, reason: decision === "reject" ? reason : undefined } },
      {
        onSuccess: () => {
          toast("success", decision === "approve" ? "تمت الموافقة على الإعلان" : "تم رفض الإعلان");
          router.push("/admin");
        },
        onError: (err) => {
          toast(err.conflict ? "info" : "error", err.message);
          if (err.conflict) router.push("/admin");
        },
      },
    );
  }

  const alreadyReviewed = p && p.status !== "pending";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.push("/admin")}>
          <ArrowRight className="size-4" aria-hidden />
          رجوع للطابور
        </Button>
        <p className="text-caption text-muted">تظهر الإعلانات الموافق عليها فقط للمستأجرين.</p>
      </div>

      <PropertyDetailView id={id} hideContact />

      {alreadyReviewed ? (
        <div className="rounded-card bg-background p-4 text-center text-small text-muted">تمت مراجعة هذا الإعلان بالفعل.</div>
      ) : (
        <div className="sticky bottom-0 flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 shadow-card">
          {rejecting && (
            <TextAreaField
              label="سبب الرفض"
              placeholder="اكتب سبب الرفض ليظهر للمالك…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
          <div className="flex gap-3">
            {rejecting ? (
              <>
                <Button variant="danger" onClick={() => decide("reject")} loading={review.isPending} className="flex-1">
                  <X className="size-4" aria-hidden />
                  تأكيد الرفض
                </Button>
                <Button variant="ghost" onClick={() => setRejecting(false)}>
                  إلغاء
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => decide("approve")} loading={review.isPending} className="flex-1 bg-success hover:bg-success/90">
                  <Check className="size-4" aria-hidden />
                  موافقة
                </Button>
                <Button variant="danger" onClick={() => setRejecting(true)} className="flex-1">
                  <X className="size-4" aria-hidden />
                  رفض
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
