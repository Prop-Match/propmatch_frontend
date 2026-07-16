"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X, ArrowRight, FileText } from "lucide-react";
import { useKycReview, useReviewKyc } from "../hooks/useAdmin";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { useToast } from "@/src/components/ui/Toast";
import { TextAreaField } from "@/src/components/ui/Field";
import { formatDate } from "@/src/utils/format";

export function AdminUserReview({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data, isLoading } = useKycReview(userId);
  const review = useReviewKyc(userId);
  const [rejectionReason, setRejectionReason] = useState("");

  function decide(decision: "approve" | "reject") {
    if (decision === "reject" && rejectionReason.trim().length < 5) {
      toast("error", "اكتب سبب الرفض أولًا");
      return;
    }
    review.mutate(
      { decision: { decision, reason: decision === "reject" ? rejectionReason.trim() : undefined } },
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
            <FileText className="size-6" aria-hidden />
          </span>
          <h1 className="text-title font-bold text-ink">مراجعة مستندات التوثيق</h1>
        </div>

        <dl className="flex flex-col gap-3 border-t border-hairline pt-4 text-body">
          <Row label="المستخدم" value={data.userName} />
          {/* The only screen that may show the full national ID (rbac.md). */}
          <Row label="الرقم القومي" value={data.nationalId} ltr />
          <Row label="تاريخ الإرسال" value={formatDate(data.submittedAt)} />
        </dl>

        {/* ID images: reviewed here only, never sent to any AI/LLM and never
            stored in the vector DB (build prompt §6). */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "وجه البطاقة الأمامي", url: data.nationalIdFrontUrl },
            { label: "وجه البطاقة الخلفي", url: data.nationalIdBackUrl },
            { label: "صورة شخصية", url: data.selfieUrl },
          ].map(({ label, url }) => (
            <figure key={label} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived KYC asset URLs; not routed through next/image */}
              <img
                src={url}
                alt={label}
                className="h-24 w-full rounded-control border border-hairline object-cover"
              />
              <figcaption className="text-caption text-muted">{label}</figcaption>
            </figure>
          ))}
        </div>

        <OwnershipDisclaimer />

        <TextAreaField
          label="سبب الرفض"
          placeholder="اكتب ما يحتاج المستخدم لتصحيحه عند الرفض"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />

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
