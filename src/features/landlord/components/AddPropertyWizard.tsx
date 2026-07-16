"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { addPropertyFormSchema, stepFields, type AddPropertyForm } from "../validation/schemas";
import { useCreateProperty, useOptimizeDescription, useQuota } from "../hooks/useLandlord";
import { InputField, TextAreaField } from "@/src/components/ui/Field";
import { ChipGroup } from "@/src/components/ui/Chip";
import { Button } from "@/src/components/ui/Button";
import { QuotaChip } from "@/src/components/ui/QuotaChip";
import { useToast } from "@/src/components/ui/Toast";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import { cn } from "@/src/utils/cn";
import { propertyTypeLabels, type PropertyType } from "@/src/lib/api/contracts/property";
import type { PaymentType } from "@/src/lib/api/contracts/payment";

const steps = ["الموقع", "النوع", "التفاصيل", "الوصف"] as const;
type StepKey = keyof typeof stepFields;
const stepKeys: StepKey[] = ["location", "type", "details", "description"];

const defaults: Partial<AddPropertyForm> = {
  governorate: "الدقهلية",
  city: "المنصورة",
  district: "",
  manualAddress: "",
  title: "",
  propertyType: "APARTMENT",
  rentAmount: 3000,
  areaM2: 100,
  bedrooms: 2,
  bathrooms: 1,
  isFurnished: false,
  hasElevator: true,
  hasParking: false,
  description: "",
  propertyAroundServices: "",
  images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop&auto=format"],
};

export function AddPropertyWizard() {
  const router = useRouter();
  const toast = useToast();
  const quota = useQuota();
  const form = useForm<AddPropertyForm>({
    resolver: zodResolver(addPropertyFormSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const [step, setStep] = useState(0);
  const create = useCreateProperty();
  const [paywall, setPaywall] = useState<PaymentType | null>(null);

  async function next() {
    const fields = stepFields[stepKeys[step]] as unknown as (keyof AddPropertyForm)[];
    if (await form.trigger(fields)) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function submit(values: AddPropertyForm) {
    create.mutate(values, {
      onSuccess: () => {
        // ERD: PROPERTY.status defaults to PENDING — admin must approve (PRO-04).
        toast("success", "تم إرسال إعلانك للمراجعة");
        router.push("/landlord");
      },
      onError: (e) => {
        if (e.code === "VERIFICATION_REQUIRED") {
          toast("info", "وثّق هويتك أولًا لنشر إعلانك");
          router.push("/landlord/verify");
        } else if (e.code === "QUOTA_EXHAUSTED") {
          setPaywall((e.paymentType as PaymentType) ?? "NEW_LISTING");
        } else {
          toast("error", e.message);
        }
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-ink">إضافة عقار</h1>
          <Stepper current={step} />
        </div>
        {quota.data && (
          <QuotaChip remaining={quota.data.freeListingsLeft} label="إعلانات مجانية متبقية" />
        )}
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
        {step === 0 && <LocationStep form={form} />}
        {step === 1 && <TypeStep form={form} />}
        {step === 2 && <DetailsStep form={form} />}
        {step === 3 && <DescriptionStep form={form} />}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ArrowRight className="size-4" aria-hidden />
            السابق
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={next}>
              التالي
              <ArrowLeft className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit" loading={create.isPending}>
              <Check className="size-4" aria-hidden />
              إرسال للمراجعة
            </Button>
          )}
        </div>
      </form>

      <PaymentSheet
        open={paywall !== null}
        onClose={() => setPaywall(null)}
        paymentType={paywall ?? "NEW_LISTING"}
        onActivated={() => {
          setPaywall(null);
          toast("success", "تم تحديث رصيدك — أرسل إعلانك الآن");
          quota.refetch();
        }}
      />
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mt-3 flex items-center gap-1.5">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 flex-col items-center gap-1">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-caption font-bold",
              i < current && "bg-success text-white",
              i === current && "bg-primary text-white",
              i > current && "bg-hairline text-muted",
            )}
          >
            {i < current ? <Check className="size-3.5" aria-hidden /> : i + 1}
          </span>
          <span className={cn("text-caption", i === current ? "font-bold text-primary" : "text-muted")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

type StepProps = { form: UseFormReturn<AddPropertyForm> };

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">{children}</div>;
}

function LocationStep({ form: { register, formState: { errors } } }: StepProps) {
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="المحافظة" {...register("governorate")} error={errors.governorate?.message} />
        <InputField label="المدينة" {...register("city")} error={errors.city?.message} />
      </div>
      <InputField label="الحي" {...register("district")} error={errors.district?.message} />
      <InputField
        label="العنوان التفصيلي"
        hint="لا يظهر للمستأجرين إلا بعد قبول العرض والتواصل."
        {...register("manualAddress")}
        error={errors.manualAddress?.message}
      />
    </Card>
  );
}

function TypeStep({ form: { control, register, formState: { errors } } }: StepProps) {
  return (
    <Card>
      <InputField label="عنوان الإعلان" placeholder="شقة مفروشة قرب جامعة المنصورة" {...register("title")} error={errors.title?.message} />
      <Controller
        control={control}
        name="propertyType"
        render={({ field }) => (
          <ChipGroup
            label="نوع العقار"
            options={(Object.keys(propertyTypeLabels) as PropertyType[]).map((v) => ({ value: v, label: propertyTypeLabels[v] }))}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Card>
  );
}

function DetailsStep({ form: { register, formState: { errors } } }: StepProps) {
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="الإيجار الشهري (ج.م)" type="number" inputMode="numeric" {...register("rentAmount", { valueAsNumber: true })} error={errors.rentAmount?.message} />
        <InputField label="المساحة (م²)" type="number" inputMode="numeric" {...register("areaM2", { valueAsNumber: true })} error={errors.areaM2?.message} />
        <InputField label="عدد غرف النوم" type="number" inputMode="numeric" {...register("bedrooms", { valueAsNumber: true })} error={errors.bedrooms?.message} />
        <InputField label="عدد الحمّامات" type="number" inputMode="numeric" {...register("bathrooms", { valueAsNumber: true })} error={errors.bathrooms?.message} />
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle label="مفروش" {...register("isFurnished")} />
        <Toggle label="يوجد أسانسير" {...register("hasElevator")} />
        <Toggle label="يوجد جراج" {...register("hasParking")} />
      </div>
    </Card>
  );
}

function DescriptionStep({ form }: StepProps) {
  const toast = useToast();
  const optimize = useOptimizeDescription();
  const description = form.watch("description");

  function runOptimize() {
    optimize.mutate(description || "عقار للإيجار", {
      onSuccess: (res) => {
        // Never auto-publish: the landlord reviews the rewrite first (PRO-10).
        form.setValue("description", res.optimized, { shouldValidate: true });
        toast("success", `تم تحسين الوصف — المتبقي: ${res.optimizerUsesLeft}`);
      },
      onError: (e) =>
        toast("error", e.code === "QUOTA_EXHAUSTED" ? "انتهت استخداماتك المجانية للتحسين" : e.message),
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-small font-semibold text-ink">الوصف</span>
        <Button type="button" variant="ghost" size="sm" onClick={runOptimize} loading={optimize.isPending}>
          <Sparkles className="size-4" aria-hidden />
          تحسين الوصف بالذكاء الاصطناعي
        </Button>
      </div>
      <TextAreaField
        placeholder="اكتب وصفًا للعقار…"
        className="min-h-40"
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      <TextAreaField
        label="الخدمات المحيطة"
        hint="تُستخدم في المطابقة الذكية — اذكر ما حول العقار (جامعة، مواصلات، أسواق…)."
        placeholder="جامعة المنصورة، مواصلات، سوبر ماركت، صيدلية"
        {...form.register("propertyAroundServices")}
      />
      {form.formState.errors.images && (
        <p className="text-caption text-error">{form.formState.errors.images.message}</p>
      )}
    </Card>
  );
}

const Toggle = function Toggle({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-small text-body-text">
      <input type="checkbox" className="size-4 accent-[var(--color-primary)]" {...rest} />
      {label}
    </label>
  );
};
