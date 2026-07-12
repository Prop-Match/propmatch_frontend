"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, CreditCard, ScanFace, Loader2, BadgeCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { useKycState, useKycUpload, useKycSubmit } from "../hooks/useKyc";
import { UploadTile } from "./UploadTile";
import { OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { formatNumber, maskNationalId } from "@/src/utils/format";
import type { KycStep } from "@/src/lib/api/contracts/verification";

const stepConfig: { step: KycStep; title: string; hint: string; Icon: typeof ScanLine }[] = [
  { step: "id-front", title: "وجه البطاقة الأمامي", hint: "صوّر بطاقة الرقم القومي من الأمام", Icon: ScanLine },
  { step: "id-back", title: "وجه البطاقة الخلفي", hint: "صوّر بطاقة الرقم القومي من الخلف", Icon: CreditCard },
  { step: "selfie", title: "صورة شخصية للتحقق (تحقق حي)", hint: "التقط صورة لوجهك", Icon: ScanFace },
];

export function KycWizard() {
  const router = useRouter();
  const { data: state, isLoading } = useKycState();
  const upload = useKycUpload();
  const submit = useKycSubmit();
  const [activeStep, setActiveStep] = useState<KycStep | null>(null);

  if (isLoading || !state) return <Skeleton className="h-96 w-full" />;

  // Terminal states
  if (state.status === "verified") {
    return (
      <ResultCard
        tone="success"
        Icon={BadgeCheck}
        title="تم توثيق هويتك"
        body={
          <div className="flex flex-col gap-1 text-body text-body-text">
            {state.extractedName && <p>الاسم: <b className="text-ink">{state.extractedName}</b></p>}
            {state.nationalIdLast4 && <p>الرقم القومي: <b className="text-ink" dir="ltr">{maskNationalId(state.nationalIdLast4)}</b></p>}
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

  if (state.status === "locked") {
    return (
      <ResultCard
        tone="error"
        Icon={ShieldAlert}
        title="تم إيقاف عملية التحقق"
        body={<p className="text-body text-body-text">استنفدت المحاولات المتاحة. برجاء التواصل مع الدعم لإعادة تفعيل التحقق.</p>}
      />
    );
  }

  if (state.status === "pending") {
    return (
      <ResultCard
        tone="pending"
        Icon={Loader2}
        spin
        title="جارٍ مراجعة هويتك"
        body={<p className="text-body text-body-text">استلمنا بياناتك، وسيراجعها فريقنا قريبًا. ستصلك النتيجة فور اكتمال المراجعة.</p>}
        action={<Button variant="secondary" onClick={() => router.push("/landlord")}>العودة للوحة التحكم</Button>}
      />
    );
  }

  const allDone = state.completedSteps.length === 3;
  const attemptsLeft = state.maxAttempts - state.attemptsUsed;

  function capture(step: KycStep, bad = false) {
    setActiveStep(step);
    upload.mutate({ step, simulateBadQuality: bad }, { onSettled: () => setActiveStep(null) });
  }

  const lastReason = upload.data && !upload.data.accepted ? upload.data.reason : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">توثيق الهوية</h1>
        <p className="mt-1 text-small text-muted">
          خطوة واحدة لكسب ثقة المستأجرين. المحاولات المتبقية: {formatNumber(attemptsLeft)}
        </p>
      </div>

      <OwnershipDisclaimer />

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

      {/* Dev affordance: simulate a bad-quality capture to exercise lock-after-3. */}
      <button
        type="button"
        onClick={() => capture("id-front", true)}
        className="text-caption text-muted underline hover:text-body-text"
      >
        محاكاة صورة منخفضة الجودة (للتجربة)
      </button>

      <Button
        size="lg"
        disabled={!allDone}
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
