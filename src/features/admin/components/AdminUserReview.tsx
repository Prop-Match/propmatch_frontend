"use client";

import { useRouter } from "next/navigation";
import { Check, X, ArrowRight, ScanFace, BadgeCheck } from "lucide-react";
import { useKycReview, useReviewKyc } from "../hooks/useAdmin";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { useToast } from "@/src/components/ui/Toast";
import { formatNumber, maskNationalId } from "@/src/utils/format";

export function AdminUserReview({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data, isLoading } = useKycReview(userId);
  const review = useReviewKyc(userId);

  function decide(decision: "approve" | "reject") {
    review.mutate(
      { decision: { decision } },
      {
        onSuccess: () => {
          toast("success", decision === "approve" ? "تم توثيق هوية المستخدم" : "تم رفض التوثيق");
          router.push("/admin");
        },
        onError: (err) => {
          toast(err.conflict ? "info" : "error", err.message);
          if (err.conflict) router.push("/admin");
        },
      },
    );
  }

  if (isLoading || !data) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Button variant="ghost" onClick={() => router.push("/admin")} className="self-start">
        <ArrowRight className="size-4" aria-hidden />
        رجوع للطابور
      </Button>

      <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-tint text-primary">
            <ScanFace className="size-6" aria-hidden />
          </span>
          <h1 className="text-title font-bold text-ink">مراجعة توثيق الهوية</h1>
        </div>

        <dl className="flex flex-col gap-3 border-t border-hairline pt-4 text-body">
          <Row label="الاسم المستخرج" value={data.extractedName} />
          <Row label="الرقم القومي" value={maskNationalId(data.nationalIdLast4)} ltr />
          <div className="flex items-center justify-between">
            <dt className="text-muted">نسبة تطابق الصورة</dt>
            <dd className="flex items-center gap-2">
              <span className="font-bold text-ink">{formatNumber(data.matchConfidence)}%</span>
              {data.matchConfidence >= 80 && <BadgeCheck className="size-4 text-success" aria-hidden />}
            </dd>
          </div>
        </dl>

        <OwnershipDisclaimer />

        <div className="flex gap-3">
          <Button onClick={() => decide("approve")} loading={review.isPending} className="flex-1 bg-success hover:bg-success/90">
            <Check className="size-4" aria-hidden />
            موافقة
          </Button>
          <Button variant="danger" onClick={() => decide("reject")} loading={review.isPending} className="flex-1">
            <X className="size-4" aria-hidden />
            رفض
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold text-ink" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
