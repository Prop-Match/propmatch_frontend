"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Sheet } from "@/src/components/ui/Sheet";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/Field";
import { api } from "@/src/lib/api/browserClient";
import { formatEGP } from "@/src/utils/format";
import {
  paymentContextLabels,
  type CheckoutSession,
  type PaymentContext,
  type PaymentResult,
} from "@/src/lib/api/contracts/payment";

type Phase = "form" | "processing" | "success" | "error";

export interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  context: PaymentContext;
  propertyId?: string;
  /** Called once the entitlement is confirmed active (post-webhook). */
  onActivated?: () => void;
}

/**
 * Reusable Paymob payment surface (design spec §4.3): bottom sheet on
 * mobile/tablet, centered modal on desktop; states form → processing →
 * success → error. Success means "payment captured" — we then poll the
 * entitlement until it's actually active (ASSUMPTIONS.md #8, webhook race).
 */
export function PaymentSheet({ open, onClose, context, propertyId, onActivated }: PaymentSheetProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [activating, setActivating] = useState(false);

  async function pay() {
    setPhase("processing");
    try {
      const checkout =
        session ??
        (await api.post<CheckoutSession>("payments/checkout", { context, propertyId }));
      setSession(checkout);
      const result = await api.post<PaymentResult>(`payments/${checkout.checkoutId}/confirm`, {
        cardNumber: cardNumber.replace(/\s/g, ""),
      });
      if (result.status === "failed") {
        setPhase("error");
        return;
      }
      setPhase("success");
      // Poll for entitlement activation (webhook lands shortly after).
      setActivating(true);
      await pollEntitlement(checkout.checkoutId);
      setActivating(false);
      onActivated?.();
    } catch {
      setPhase("error");
    }
  }

  async function pollEntitlement(checkoutId: string) {
    for (let i = 0; i < 12; i++) {
      const status = await api.get<PaymentResult>(`payments/${checkoutId}`);
      if (status.entitlementActive) return;
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  function reset() {
    setPhase("form");
    setCardNumber("");
    setSession(null);
    onClose();
  }

  return (
    <Sheet open={open} onClose={reset} title="الدفع عبر Paymob" dismissible={phase !== "processing"}>
      {phase === "form" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-control bg-primary-tint px-4 py-3">
            <span className="text-small font-semibold text-primary-dark">{paymentContextLabels[context]}</span>
            <span className="text-title font-bold text-primary">
              {formatEGP(context === "listing" ? 100 : context === "boost" ? 75 : 30)}
            </span>
          </div>
          <InputField
            label="رقم البطاقة"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="تاريخ الانتهاء" placeholder="MM/YY" />
            <InputField label="CVV" inputMode="numeric" placeholder="123" />
          </div>
          <p className="flex items-center gap-1.5 text-caption text-muted">
            <ShieldCheck className="size-3.5" aria-hidden />
            دفع آمن ومباشر بالجنيه المصري — بدون محافظ أو نقاط.
          </p>
          <Button size="lg" block onClick={pay} disabled={cardNumber.replace(/\s/g, "").length < 12}>
            <CreditCard className="size-4" aria-hidden />
            ادفع الآن
          </Button>
        </div>
      )}

      {phase === "processing" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <p className="text-body font-semibold text-ink">جارٍ معالجة الدفع…</p>
        </div>
      )}

      {phase === "success" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <p className="text-title font-bold text-ink">تم الدفع بنجاح</p>
          <p className="text-small text-muted">
            {activating ? "جارٍ تفعيل خدمتك…" : "تم تفعيل خدمتك."}
          </p>
          <Button block onClick={reset} disabled={activating} loading={activating}>
            {activating ? "لحظات…" : "تم"}
          </Button>
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="size-12 text-error" aria-hidden />
          <p className="text-title font-bold text-ink">فشلت عملية الدفع</p>
          <p className="text-small text-muted">حاول مرة أخرى أو استخدم بطاقة أخرى.</p>
          <Button block variant="secondary" onClick={() => setPhase("form")}>
            إعادة المحاولة
          </Button>
        </div>
      )}
    </Sheet>
  );
}
