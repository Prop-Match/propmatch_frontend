"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, CreditCard, MapPinned, Loader2, BadgeCheck, ShieldAlert, ArrowLeft, XCircle } from "lucide-react";
import { useKycState, useKycUpload, useKycSubmit } from "../hooks/useKyc";
import { UploadTile } from "./UploadTile";
import { OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { formatDate } from "@/src/utils/format";
import type { KycStep } from "@/src/lib/api/contracts/verification";

const stepConfig: { step: KycStep; title: string; hint: string; Icon: typeof FileText }[] = [
  { step: "license", title: "الرخصة أو السجل التجاري", hint: "ارفع مستند النشاط أو الترخيص القانوني إن وجد", Icon: FileText },
  { step: "government_id", title: "بطاقة الهوية", hint: "ارفع صورة واضحة لبطاقة الرقم القومي", Icon: CreditCard },
  { step: "proof_of_address", title: "إثبات العنوان", hint: "ارفع إيصال مرافق أو مستند يثبت عنوانك", Icon: MapPinned },
];

export function KycWizard() {
  const router = useRouter();
  const { data: state, isLoading } = useKycState();
  const upload = useKycUpload();
  const submit = useKycSubmit();
  const [activeStep, setActiveStep] = useState<KycStep | null>(null);
  const [renderedAt] = useState(() => Date.now());

  if (isLoading || !state) return <Skeleton className="h-96 w-full" />;

  // Terminal states
  if (state.status === "verified") {
    return (
      <ResultCard
        tone="success"
        Icon={BadgeCheck}
        title="تمت الموافقة على التوثيق"
        body={
          <div className="flex flex-col gap-1 text-body text-body-text">
            <p>يمكنك الآن إنشاء ونشر عدد غير محدود من الإعلانات بدون إعادة التوثيق.</p>
            {state.verifiedAt && <p>تاريخ الموافقة: <b className="text-ink">{formatDate(state.verifiedAt)}</b></p>}
          </div>
        }
        action={
          <Button onClick={() => router.push("/landlord")}>
            المتابعة إلى لوحة التحكم
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        }
      />
    );
  }

  if (state.status === "rejected") {
    const cooldownActive = Boolean(state.resubmitAfter && new Date(state.resubmitAfter).getTime() > renderedAt);
    if (cooldownActive) {
      return (
        <ResultCard
          tone="error"
          Icon={XCircle}
          title="تم رفض طلب التوثيق"
          body={
            <div className="flex flex-col gap-2 text-body text-body-text">
              {state.rejectionReason && <p>سبب الرفض: <b className="text-ink">{state.rejectionReason}</b></p>}
              {state.resubmitAfter && <p>يمكنك إعادة الإرسال بعد {formatDate(state.resubmitAfter)}.</p>}
            </div>
          }
          action={<Button variant="secondary" onClick={() => router.push("/landlord")}>العودة للوحة التحكم</Button>}
        />
      );
    }
  }

  if (state.status === "pending_review") {
    return (
      <ResultCard
        tone="pending"
        Icon={Loader2}
        spin
        title="طلب التوثيق قيد المراجعة"
        body={<p className="text-body text-body-text">استلمنا مستنداتك، ولا يمكنك إرسال طلب آخر حتى يراجعها فريق الإدارة.</p>}
        action={<Button variant="secondary" onClick={() => router.push("/landlord")}>العودة للوحة التحكم</Button>}
      />
    );
  }

  const allDone = state.completedSteps.length === 3;

  function capture(step: KycStep, bad = false) {
    setActiveStep(step);
    upload.mutate({ step, simulateBadQuality: bad }, { onSettled: () => setActiveStep(null) });
  }

  const lastReason = upload.data && !upload.data.accepted ? upload.data.reason : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">توثيق مستندات المالك</h1>
        <p className="mt-1 text-small text-muted">
          التوثيق مطلوب مرة واحدة فقط قبل نشر الإعلانات، وبعد الموافقة يمكنك إنشاء إعلانات بدون إعادة التوثيق.
        </p>
      </div>

      <OwnershipDisclaimer />

      {state.status === "rejected" && state.rejectionReason && (
        <div className="flex items-start gap-3 rounded-card border border-error/30 bg-error-tint px-4 py-3">
          <XCircle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
          <div>
            <p className="text-small font-bold text-error">تم رفض الطلب السابق</p>
            <p className="text-caption text-body-text">سبب الرفض: {state.rejectionReason}</p>
          </div>
        </div>
      )}

      {!state.hasListingIntent && (
        <div className="flex items-start gap-3 rounded-card border border-pending/30 bg-pending-tint px-4 py-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-pending" aria-hidden />
          <div className="flex-1">
            <p className="text-small font-bold text-pending">ابدأ بإضافة مسودة إعلان أولًا</p>
            <p className="text-caption text-body-text">التوثيق متاح فقط للمستخدمين الذين بدأوا إضافة عقار داخل المنصة.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => router.push("/landlord/properties/new")}>
            إضافة عقار
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stepConfig.map(({ step, title, hint, Icon }) => {
          const done = state.completedSteps.includes(step);
          const isUploading = activeStep === step && upload.isPending;
          const isBad = !done && upload.variables?.step === step && upload.data?.accepted === false;
          return (
            <UploadTile
              key={step}
              title={title}
              hint={hint}
              Icon={Icon}
              reason={isBad ? lastReason : undefined}
              state={done ? "captured" : isUploading ? "uploading" : isBad ? "bad-quality" : "empty"}
              onCapture={() => capture(step)}
            />
          );
        })}
      </div>

      {/* Dev-only: simulate an invalid document to exercise rejection-style upload errors. */}
      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={() => capture("government_id", true)}
          className="text-caption text-muted underline hover:text-body-text"
        >
          محاكاة مستند غير واضح (للتجربة)
        </button>
      )}

      <Button
        size="lg"
        disabled={!allDone || !state.canSubmit}
        loading={submit.isPending}
        onClick={() => submit.mutate(undefined, { onSuccess: () => undefined })}
      >
        إرسال للمراجعة
      </Button>
    </div>
  );
}

function ResultCard({
  tone,
  Icon,
  title,
  body,
  action,
  spin,
}: {
  tone: "success" | "error" | "pending";
  Icon: typeof BadgeCheck;
  title: string;
  body: React.ReactNode;
  action?: React.ReactNode;
  spin?: boolean;
}) {
  const toneClass = {
    success: "bg-success-tint text-success",
    error: "bg-error-tint text-error",
    pending: "bg-pending-tint text-pending",
  }[tone];
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-hairline bg-surface p-8 text-center shadow-card">
      <span className={`flex size-16 items-center justify-center rounded-full ${toneClass}`}>
        <Icon className={`size-8 ${spin ? "animate-spin" : ""}`} aria-hidden />
      </span>
      <h1 className="text-h2 font-bold text-ink">{title}</h1>
      {body}
      {action}
    </div>
  );
}
