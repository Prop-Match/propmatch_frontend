"use client";

import { useState } from "react";
import { Truck, ShieldCheck, Check } from "lucide-react";
import { Sheet } from "@/src/components/ui/Sheet";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import {
  partnerServiceLabels,
  type PartnerServiceType,
} from "@/src/lib/api/contracts/partnerLead";
import { useCreatePartnerLeads } from "../hooks/usePartnerLeads";

const icons: Record<PartnerServiceType, typeof Truck> = {
  MOVING: Truck,
  INSURANCE: ShieldCheck,
};

const descriptions: Record<PartnerServiceType, string> = {
  MOVING: "نوصّلك بشركة نقل عفش موثوقة في المنصورة.",
  INSURANCE: "عرض تأمين على محتويات وحدتك الجديدة.",
};

/**
 * PRO-16 — offered immediately after a match connects, while the tenant is
 * actually about to move. Opt-in is explicit and starts empty: no boxes are
 * pre-ticked and nothing reaches a partner until the tenant confirms.
 */
export function PartnerOptInSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const create = useCreatePartnerLeads();
  const [selected, setSelected] = useState<PartnerServiceType[]>([]);

  function toggle(service: PartnerServiceType) {
    setSelected((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]));
  }

  function submit() {
    create.mutate(
      { serviceTypes: selected },
      {
        onSuccess: () => {
          toast("success", "سنوصّلك بالشريك المناسب قريبًا");
          setSelected([]);
          onClose();
        },
        onError: () => toast("error", "تعذر إرسال طلبك، حاول مرة أخرى"),
      },
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="خدمات تساعدك في الانتقال" dismissible={!create.isPending}>
      <div className="flex flex-col gap-4">
        <p className="text-small text-muted">
          اختياري تمامًا — لن نشارك بياناتك مع أي شريك إلا إذا اخترت ذلك بنفسك.
        </p>

        <ul className="flex flex-col gap-2">
          {(Object.keys(partnerServiceLabels) as PartnerServiceType[]).map((service) => {
            const Icon = icons[service];
            const isSelected = selected.includes(service);
            return (
              <li key={service}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-card border p-3.5 transition-colors ${
                    isSelected ? "border-primary bg-primary-tint" : "border-hairline bg-surface hover:border-primary/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-primary"
                    checked={isSelected}
                    onChange={() => toggle(service)}
                  />
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-small font-bold text-ink">{partnerServiceLabels[service]}</span>
                    <span className="block text-caption text-muted">{descriptions[service]}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2">
          <Button variant="ghost" block onClick={onClose} disabled={create.isPending}>
            لا، شكرًا
          </Button>
          <Button block onClick={submit} loading={create.isPending} disabled={selected.length === 0}>
            <Check className="size-4" aria-hidden />
            وافق وتواصلوا معي
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
