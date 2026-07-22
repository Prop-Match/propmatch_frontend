"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Sheet } from "@/src/components/ui/Sheet";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/Field";
import { api } from "@/src/lib/api/browserClient";
import { formatEGP } from "@/src/utils/format";
import {
  paymentTypeLabels,
  type CheckoutSession,
  type PaymentTransaction,
  type PaymentType,
} from "@/src/lib/api/contracts/payment";

type Phase = "form" | "processing" | "success" | "error";

export interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  paymentType: PaymentType;
  /** For NEW_LISTING / BOOST_LISTING. */
  propertyId?: string;
  /** Fired once the webhook-credited entitlement is confirmed. */
  onActivated?: () => void;
}

/**
 * Paymob payment surface (PRO-14): bottom sheet on mobile, modal on desktop.
 *
 * A client-side success means the payment was **captured**, not that the quota
 * was **credited** — the webhook does that. So we poll the transaction after
 * success rather than trusting our own state (ASSUMPTIONS.md #17). In the real
 * build the form below is replaced by the Paymob iframe (`iframeUrl`).
 */
export function PaymentSheet({ open, onClose, paymentType, propertyId, onActivated }: PaymentSheetProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [activating, setActivating] = useState(false);

  async function pay() {
    setPhase("processing");
    try {
      const checkout =
        session ?? (await api.post<CheckoutSession>("payments/checkout", { paymentType, propertyId }));
      setSession(checkout);
      if (checkout.iframeUrl) {
        // Keep the order id so the return page can ask our backend to verify
        // the transaction with Paymob after the customer leaves the checkout.
        window.localStorage.setItem(
          "propmatch:pending-payment",
          JSON.stringify({ paymobOrderId: checkout.paymobOrderId }),
        );
        window.location.assign(checkout.iframeUrl);
        return;
      }
      const result = await api.post<{ status: string }>(`payments/${checkout.paymobOrderId}/confirm`, {
        cardNumber: cardNumber.replace(/\s/g, ""),
      });
      if (result.status === "FAILED") {
        setPhase("error");
        return;
      }
      setPhase("success");
      setActivating(true);
      await pollSettled(checkout.paymobOrderId);
      setActivating(false);
      onActivated?.();
    } catch {
      setPhase("error");
    }
  }

  /** Wait for the (simulated) webhook to mark the transaction settled. */
  async function pollSettled(paymobOrderId: string) {
    for (let i = 0; i < 12; i++) {
      const tx = await api.get<PaymentTransaction>(`payments/${paymobOrderId}`);
      if (tx.status === "SUCCESS" && tx.paidAt) return;
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
            <span className="text-small font-semibold text-primary-dark">{paymentTypeLabels[paymentType]}</span>
            <span className="text-title font-bold text-primary">
              {formatEGP(session?.amount ?? { NEW_LISTING: 100, BOOST_LISTING: 75, REFILL_MATCHES: 30, OFFER_PACK: 50 }[paymentType])}
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
            دفع آمن ومباشر بالجنيه المصري.
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
          <p className="text-small text-muted">{activating ? "جارٍ تحديث رصيدك…" : "تم تحديث رصيدك."}</p>
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
