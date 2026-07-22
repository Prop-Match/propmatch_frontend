"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ShieldQuestion } from "lucide-react";
import { InputField, TextAreaField } from "@/src/components/ui/Field";
import { ChipGroup } from "@/src/components/ui/Chip";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { formatNumber } from "@/src/utils/format";
import { useCreateTenantRequest } from "../hooks/useTenantRequests";
import {
  CreateTenantRequestSchema,
  type CreateTenantRequest,
} from "@/src/lib/api/contracts/tenantRequest";
import { propertyTypeLabels, type PropertyType } from "@/src/lib/api/contracts/property";
import { VerificationGate } from "@/src/features/ekyc/components/VerificationGate";

const defaults: CreateTenantRequest = {
  minBudget: 2000,
  maxBudget: 5000,
  preferredLocations: "",
  propertyType: "APARTMENT",
  requiredBedrooms: 2,
  needsFurnished: false,
  flexibilityScore: 5,
  lifestyleRequirements: "",
};

/**
 * PRO-05 — the tenant posts what they're looking for and verified landlords
 * come to them. The request enters PENDING for admin approval (anti-spam,
 * SRS 3.2.2); nothing is published until then, so the success copy says so.
 */
export function TenantRequestForm() {
  return (
    <VerificationGate verificationPath="/verify">
      <TenantRequestFormContent />
    </VerificationGate>
  );
}

function TenantRequestFormContent() {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateTenantRequest();
  const form = useForm<CreateTenantRequest>({
    resolver: zodResolver(CreateTenantRequestSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  function submit(values: CreateTenantRequest) {
    create.mutate(values, {
      onSuccess: () => {
        toast("success", "تم إرسال طلبك للمراجعة");
        router.push("/tenant/requests");
      },
      onError: (e) => {
        if (e.code === "VERIFICATION_REQUIRED") {
          toast("info", e.message);
        } else {
          toast("error", e.message);
        }
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold text-ink">اطلب سكنك</h1>
        <p className="mt-1 text-small text-muted">
          اكتب ما تبحث عنه، ويصلك عرض من الملّاك الموثّقين مباشرة — بدون وسيط.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              label="أقل ميزانية (ج.م)"
              type="number"
              inputMode="numeric"
              required
              {...register("minBudget", { valueAsNumber: true })}
              error={errors.minBudget?.message}
            />
            <InputField
              label="أعلى ميزانية (ج.م)"
              type="number"
              inputMode="numeric"
              required
              {...register("maxBudget", { valueAsNumber: true })}
              error={errors.maxBudget?.message}
            />
          </div>
          <InputField
            label="المناطق المفضلة"
            placeholder="حي الجامعة، توريل، المشاية"
            hint="اذكر أكثر من منطقة لزيادة فرص وصول العروض."
            required
            {...register("preferredLocations")}
            error={errors.preferredLocations?.message}
          />
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
          <Controller
            control={control}
            name="propertyType"
            render={({ field }) => (
              <ChipGroup
                label="نوع العقار"
                options={(Object.keys(propertyTypeLabels) as PropertyType[]).map((v) => ({
                  value: v,
                  label: propertyTypeLabels[v],
                }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField
              label="عدد غرف النوم المطلوبة"
              type="number"
              inputMode="numeric"
              required
              {...register("requiredBedrooms", { valueAsNumber: true })}
              error={errors.requiredBedrooms?.message}
            />
            <label className="flex cursor-pointer items-end gap-2 pb-3 text-small text-body-text">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                {...register("needsFurnished")}
              />
              أحتاج وحدة مفروشة
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
          <Controller
            control={control}
            name="flexibilityScore"
            render={({ field }) => <FlexibilitySlider value={field.value} onChange={field.onChange} />}
          />
          <TextAreaField
            label="ما الذي تبحث عنه بالضبط؟"
            required
            className="min-h-36"
            placeholder="أبحث عن شقة هادئة قريبة من جامعة المنصورة، يفضّل دور عالٍ وقريبة من المواصلات…"
            hint="اكتب بحرية — نستخدم هذا النص في المطابقة الذكية مع عقارات الملّاك."
            {...register("lifestyleRequirements")}
            error={errors.lifestyleRequirements?.message}
          />
        </section>

        <p className="flex items-start gap-2 rounded-control bg-trust-blue-tint px-3.5 py-2.5 text-caption leading-relaxed text-body-text">
          <ShieldQuestion className="mt-0.5 size-4 shrink-0" aria-hidden />
          بياناتك الشخصية لا تظهر للملّاك — يرون تفاصيل الطلب فقط، ولا يصلهم رقمك إلا بعد قبولك لعرض منهم.
        </p>

        <Button type="submit" size="lg" block loading={create.isPending}>
          <Check className="size-4" aria-hidden />
          إرسال الطلب للمراجعة
        </Button>
      </form>
    </div>
  );
}

/** ERD: `flexibility_score` 1–10 — how much the matcher may bend the criteria. */
function FlexibilitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="flexibility" className="text-small font-semibold text-ink">
          مدى مرونتك في الشروط
        </label>
        <span className="rounded-pill bg-primary-tint px-2.5 py-0.5 text-caption font-bold text-primary">
          {formatNumber(value)} / {formatNumber(10)}
        </span>
      </div>
      <input
        id="flexibility"
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-caption text-muted">
        <span>شروطي ثابتة</span>
        <span>مرن جدًا</span>
      </div>
    </div>
  );
}
