"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, CreditCard, ScanFace, Loader2, BadgeCheck, XCircle, ArrowLeft } from "lucide-react";
import { useVerificationState, useUploadDocument, useSubmitVerification } from "../hooks/useKyc";
import { useSession } from "@/src/features/auth/hooks/useSession";
import { UploadTile } from "./UploadTile";
import { OwnershipDisclaimer } from "@/src/components/ui/VerifiedBadge";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/Field";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { maskNationalId } from "@/src/utils/format";
import { kycDocumentLabels, type KycDocument } from "@/src/lib/api/contracts/verification";

/** PRO-03: National ID front → back → selfie, then submit → PENDING. */
const stepConfig: { document: KycDocument; hint: string; Icon: typeof ScanLine }[] = [
  { document: "national_id_front", hint: "صوّر وجه البطاقة الأمامي بوضوح", Icon: ScanLine },
  { document: "national_id_back", hint: "صوّر وجه البطاقة الخلفي", Icon: CreditCard },
  { document: "selfie", hint: "التقط صورة شخصية للتحقق", Icon: ScanFace },
];

export function KycWizard() {
  const router = useRouter();
  const { data: state, isLoading } = useVerificationState();
  const { data: session } = useSession();
  const targetDashboard = session?.role === "tenant" ? "/tenant" : session?.role === "admin" ? "/admin" : "/landlord";
  const upload = useUploadDocument();
  const submit = useSubmitVerification();
  const [active, setActive] = useState<KycDocument | null>(null);
  const [captured, setCaptured] = useState<KycDocument[]>([]);
  const [nationalId, setNationalId] = useState("");

  if (isLoading || !state) return <Skeleton className="h-96 w-full" />;

  if (state.status === "APPROVED") {
    return (
      <ResultCard
        tone="success"
        Icon={BadgeCheck}
        title="تم توثيق هويتك"
        body={
          <div className="flex flex-col gap-1 text-body text-body-text">
            <p>يمكنك الآن نشر إعلاناتك وطلباتك والتواصل بعد قبول العروض.</p>
            {state.nationalIdLast4 && (
              <p>
                الرقم القومي: <b className="text-ink" dir="ltr">{maskNationalId(state.nationalIdLast4)}</b>
              </p>
            )}
          </div>
        }
        action={
          <Button onClick={() => router.push(targetDashboard)}>
            المتابعة
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        }
      />
    );
  }

  if (state.status === "PENDING") {
    return (
      <ResultCard
        tone="pending"
        Icon={Loader2}
        spin
        title="طلب التوثيق قيد المراجعة"
        body={
          <p className="text-body text-body-text">
            استلمنا مستنداتك وسيراجعها فريق الإدارة قريبًا. لا يمكنك إرسال طلب آخر أثناء المراجعة.
          </p>
        }
        action={<Button variant="secondary" onClick={() => router.push(targetDashboard)}>العودة</Button>}
      />
    );
  }

  const allCaptured = stepConfig.every((s) => captured.includes(s.document));
  const lastReason = upload.data && !upload.data.accepted ? upload.data.reason : null;

  function capture(document: KycDocument, simulateUnreadable = false) {
    setActive(document);
    upload.mutate(
      { document, simulateUnreadable },
      {
        onSuccess: (res) => {
          if (res.accepted) setCaptured((c) => (c.includes(document) ? c : [...c, document]));
        },
        onSettled: () => setActive(null),
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-h1 font-bold text-ink">توثيق الهوية</h1>
        <p className="mt-1 text-small text-muted">
          التوثيق مطلوب مرة واحدة قبل نشر إعلان أو طلب، وقبل قبول العروض.
        </p>
      </div>

      <OwnershipDisclaimer />

      {/* REJECTED → the user fixes what the admin flagged and resubmits. */}
      {state.rejectionReason && (
        <div className="flex items-start gap-3 rounded-card border border-error/30 bg-error-tint px-4 py-3">
          <XCircle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
          <div>
            <p className="text-small font-bold text-error">تم رفض الطلب السابق</p>
            <p className="text-caption text-body-text">{state.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stepConfig.map(({ document, hint, Icon }) => {
          const done = captured.includes(document);
          const isUploading = active === document && upload.isPending;
          const isBad = !done && upload.variables?.document === document && upload.data?.accepted === false;
          return (
            <UploadTile
              key={document}
              title={kycDocumentLabels[document]}
              hint={hint}
              Icon={Icon}
              reason={isBad ? lastReason : undefined}
              state={done ? "captured" : isUploading ? "uploading" : isBad ? "bad-quality" : "empty"}
              onCapture={() => capture(document)}
            />
          );
        })}
      </div>

      <InputField
        label="الرقم القومي"
        inputMode="numeric"
        dir="ltr"
        placeholder="14 رقمًا"
        value={nationalId}
        onChange={(e) => setNationalId(e.target.value)}
        hint="يُستخدم للتحقق فقط، ويظهر مخفيًا في كل مكان عدا العقد."
      />

      {/* Dev-only: exercise the unreadable-document path. */}
      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={() => capture("national_id_front", true)}
          className="text-caption text-muted underline hover:text-body-text"
        >
          محاكاة مستند غير واضح (للتجربة)
        </button>
      )}

      <Button
        size="lg"
        disabled={!allCaptured || !state.canSubmit || !/^\d{14}$/.test(nationalId)}
        loading={submit.isPending}
        onClick={() => submit.mutate(nationalId)}
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
