"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Sheet } from "@/src/components/ui/Sheet";
import { Button } from "@/src/components/ui/Button";
import { InputField, SelectField, TextAreaField } from "@/src/components/ui/Field";
import { QuotaChip } from "@/src/components/ui/QuotaChip";
import { EmptyState } from "@/src/components/ui/States";
import { useToast } from "@/src/components/ui/Toast";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import { useMyProperties, useQuota } from "@/src/features/landlord/hooks/useLandlord";
import { formatEGP } from "@/src/utils/format";
import { CreateOfferRequestSchema, type CreateOfferRequest } from "@/src/lib/api/contracts/offer";
import type { BrowsableTenantRequest } from "@/src/lib/api/contracts/tenantRequest";
import type { PaymentType } from "@/src/lib/api/contracts/payment";
import { useSendOffer } from "../hooks/useOffers";

export interface SendOfferSheetProps {
  request: BrowsableTenantRequest | null;
  onClose: () => void;
}

/**
 * PRO-13 — the landlord pitches one of their APPROVED properties against a
 * tenant request. Costs one `free_offers_left`; the backend rejects with
 * QUOTA_EXHAUSTED once spent, which opens the OFFER_PACK paywall (PRO-18).
 */
export function SendOfferSheet({ request, onClose }: SendOfferSheetProps) {
  const router = useRouter();
  const toast = useToast();
  const quota = useQuota();
  const properties = useMyProperties();
  const send = useSendOffer();
  const [paywall, setPaywall] = useState<PaymentType | null>(null);

  const [propertyId, setPropertyId] = useState("");
  const [pitchMessage, setPitchMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOfferRequest, string>>>({});

  // Only APPROVED properties can back an offer — the backend enforces it too.
  const offerable = (properties.data?.items ?? []).filter((p) => p.status === "APPROVED");

  function reset() {
    setPropertyId("");
    setPitchMessage("");
    setProposedPrice("");
    setErrors({});
    onClose();
  }

  function submit() {
    if (!request) return;
    const parsed = CreateOfferRequestSchema.safeParse({
      tenantRequestId: request.id,
      propertyId,
      pitchMessage,
      proposedPrice: Number(proposedPrice),
    });
    if (!parsed.success) {
      const next: Partial<Record<keyof CreateOfferRequest, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateOfferRequest;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    send.mutate(parsed.data, {
      onSuccess: (res) => {
        toast("success", `تم إرسال عرضك — المتبقي: ${res.freeOffersLeft}`);
        reset();
      },
      onError: (e) => {
        if (e.code === "VERIFICATION_REQUIRED") {
          toast("info", "وثّق هويتك أولًا لإرسال العروض");
          router.push("/landlord/verify");
        } else if (e.code === "QUOTA_EXHAUSTED") {
          setPaywall(e.paymentType ?? "OFFER_PACK");
        } else {
          toast("error", e.message);
        }
      },
    });
  }

  return (
    <>
      <Sheet open={request !== null} onClose={reset} title="إرسال عرض" dismissible={!send.isPending}>
        {request && (
          <div className="flex flex-col gap-4">
            <div className="rounded-control bg-primary-tint px-4 py-3">
              <p className="text-caption text-primary-dark">ميزانية المستأجر</p>
              <p className="text-title font-bold text-primary">
                {formatEGP(request.minBudget)} – {formatEGP(request.maxBudget)}
              </p>
            </div>

            {properties.isLoading ? (
              <p className="py-6 text-center text-small text-muted">جارٍ تحميل عقاراتك…</p>
            ) : offerable.length === 0 ? (
              <EmptyState
                title="لا يوجد عقار معتمد"
                description="تحتاج عقارًا واحدًا على الأقل تمت الموافقة عليه قبل إرسال العروض."
                action={
                  <Button onClick={() => router.push("/landlord/properties/new")}>أضف عقارًا</Button>
                }
              />
            ) : (
              <>
                <SelectField
                  label="اختر العقار"
                  required
                  placeholder="— اختر عقارًا —"
                  value={propertyId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setPropertyId(selectedId);
                    const chosen = offerable.find((p) => p.id === selectedId);
                    if (chosen) {
                      setProposedPrice(chosen.rentAmount.toString());
                    } else {
                      setProposedPrice("");
                    }
                  }}
                  error={errors.propertyId}
                  options={offerable.map((p) => {
                    const pct = calculateMatchScore(request, p);
                    return {
                      value: p.id,
                      label: `${p.title} · ${formatEGP(p.rentAmount)} (${pct}%)`,
                    };
                  })}
                />
                <TextAreaField
                  label="رسالتك للمستأجر"
                  required
                  placeholder="عقاري يناسب طلبك لأنه…"
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  error={errors.pitchMessage}
                />
                {quota.data && (
                  <QuotaChip remaining={quota.data.freeOffersLeft} label="عروض مجانية متبقية" className="self-start" />
                )}
                <Button size="lg" block onClick={submit} loading={send.isPending}>
                  <Send className="size-4" aria-hidden />
                  إرسال العرض
                </Button>
              </>
            )}
          </div>
        )}
      </Sheet>

      <PaymentSheet
        open={paywall !== null}
        onClose={() => setPaywall(null)}
        paymentType={paywall ?? "OFFER_PACK"}
        onActivated={() => {
          setPaywall(null);
          toast("success", "تم تحديث رصيدك — أرسل عرضك الآن");
          quota.refetch();
        }}
      />
    </>
  );
}

function calculateMatchScore(r: BrowsableTenantRequest, p: any): number {
  let score = 50;
  if (p.rentAmount >= r.minBudget && p.rentAmount <= r.maxBudget) score += 18;
  else score -= 22;
  const district = p.district || "";
  if (r.preferredLocations.includes(district)) score += 12;
  if (p.propertyType === r.propertyType) score += 8;
  if (p.bedrooms >= r.requiredBedrooms) score += 5;
  if (!r.needsFurnished || p.isFurnished) score += 5;
  if (p.description) {
    const words = r.lifestyleRequirements.split(/\s+/).filter((w) => w.length > 3);
    const haystack = `${p.description || ""} ${p.propertyAroundServices || ""}`;
    score += Math.min(10, words.filter((w) => haystack.includes(w)).length * 2);
  }
  score += Math.round((r.flexibilityScore - 5) * 0.6);
  if (p.isBoosted) score += 2;
  return Math.max(5, Math.min(98, Math.round(score)));
}
