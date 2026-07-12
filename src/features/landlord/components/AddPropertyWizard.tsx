"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { addPropertyFormSchema, stepFields, type AddPropertyForm } from "../validation/schemas";
import { useCreateProperty, useOptimizeDescription, type CreatePropertyResult } from "../hooks/useLandlord";
import { InputField, SelectField, TextAreaField } from "@/src/components/ui/Field";
import { ChipGroup } from "@/src/components/ui/Chip";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import { cn } from "@/src/utils/cn";
import {
  amenityLabels,
  propertyTypeLabels,
  finishLabels,
  orientationLabels,
  type Amenity,
  type PropertyType,
  type Finish,
  type Orientation,
} from "@/src/lib/api/contracts/property";

const steps = ["الموقع", "النوع", "التفاصيل", "الخدمات", "الشروط", "الوصف"] as const;
type StepKey = keyof typeof stepFields;
const stepKeys: StepKey[] = ["location", "type", "details", "amenities", "conditions", "description"];

const defaults: Partial<AddPropertyForm> = {
  location: { governorate: "الدقهلية", city: "المنصورة", neighborhood: "", street: "", detailedAddress: "" },
  type: "apartment",
  monthlyRent: 3000,
  deposit: 6000,
  leaseDurationMonths: 12,
  area: 100,
  rooms: 2,
  bathrooms: 1,
  floor: 1,
  hasElevator: true,
  furnished: false,
  finish: "lux",
  orientation: "bahari",
  amenities: [],
  conditions: {
    familiesOnly: false,
    studentsAllowed: true,
    singlesAllowed: true,
    foreignersAllowed: true,
    childrenAllowed: true,
    petsAllowed: false,
    smokingAllowed: false,
    minLeaseMonths: 6,
  },
  description: "",
  photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=500&fit=crop&auto=format"],
};

export function AddPropertyWizard() {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<AddPropertyForm>({ resolver: zodResolver(addPropertyFormSchema), defaultValues: defaults, mode: "onTouched" });
  const [step, setStep] = useState(0);
  const create = useCreateProperty();
  const [payment, setPayment] = useState<{ open: boolean; propertyId?: string }>({ open: false });

  async function next() {
    const fields = stepFields[stepKeys[step]] as unknown as (keyof AddPropertyForm)[];
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function submit(values: AddPropertyForm) {
    create.mutate(values, {
      onSuccess: (res: CreatePropertyResult) => {
        if (res.requiresPayment) {
          // 2nd+ listing: pay before it enters review.
          setPayment({ open: true, propertyId: res.property.id });
        } else {
          toast("success", "تم إرسال إعلانك للمراجعة");
          router.push("/landlord");
        }
      },
      onError: () => toast("error", "تعذر إنشاء الإعلان، حاول مرة أخرى"),
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-h1 font-bold text-ink">إضافة عقار</h1>
        <Stepper current={step} />
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
        {step === 0 && <LocationStep form={form} />}
        {step === 1 && <TypeStep form={form} />}
        {step === 2 && <DetailsStep form={form} />}
        {step === 3 && <AmenitiesStep form={form} />}
        {step === 4 && <ConditionsStep form={form} />}
        {step === 5 && <DescriptionStep form={form} />}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
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
              نشر الإعلان
            </Button>
          )}
        </div>
      </form>

      <PaymentSheet
        open={payment.open}
        onClose={() => setPayment({ open: false })}
        context="listing"
        propertyId={payment.propertyId}
        onActivated={() => {
          toast("success", "تم الدفع وإرسال إعلانك للمراجعة");
          router.push("/landlord");
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
        <InputField label="المحافظة" {...register("location.governorate")} error={errors.location?.governorate?.message} />
        <InputField label="المدينة" {...register("location.city")} error={errors.location?.city?.message} />
        <InputField label="الحي" {...register("location.neighborhood")} error={errors.location?.neighborhood?.message} />
        <InputField label="الشارع (اختياري)" {...register("location.street")} />
      </div>
      <InputField label="عنوان تفصيلي" {...register("location.detailedAddress")} error={errors.location?.detailedAddress?.message} />
    </Card>
  );
}

function TypeStep({ form: { control } }: StepProps) {
  return (
    <Card>
      <Controller
        control={control}
        name="type"
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
        <InputField label="السعر الشهري" type="number" inputMode="numeric" {...register("monthlyRent", { valueAsNumber: true })} error={errors.monthlyRent?.message} />
        <InputField label="مبلغ التأمين" type="number" inputMode="numeric" {...register("deposit", { valueAsNumber: true })} />
        <InputField label="مدة العقد (شهور)" type="number" inputMode="numeric" {...register("leaseDurationMonths", { valueAsNumber: true })} />
        <InputField label="المساحة (م²)" type="number" inputMode="numeric" {...register("area", { valueAsNumber: true })} />
        <InputField label="عدد الغرف" type="number" inputMode="numeric" {...register("rooms", { valueAsNumber: true })} />
        <InputField label="عدد الحمامات" type="number" inputMode="numeric" {...register("bathrooms", { valueAsNumber: true })} />
        <InputField label="الدور" type="number" inputMode="numeric" {...register("floor", { valueAsNumber: true })} />
        <SelectField label="التشطيب" options={(Object.keys(finishLabels) as Finish[]).map((v) => ({ value: v, label: finishLabels[v] }))} {...register("finish")} />
        <SelectField label="اتجاه الشقة" options={(Object.keys(orientationLabels) as Orientation[]).map((v) => ({ value: v, label: orientationLabels[v] }))} {...register("orientation")} />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-small text-body-text">
          <input type="checkbox" className="size-4 accent-[var(--color-primary)]" {...register("hasElevator")} />
          يوجد أسانسير؟
        </label>
        <label className="flex items-center gap-2 text-small text-body-text">
          <input type="checkbox" className="size-4 accent-[var(--color-primary)]" {...register("furnished")} />
          مفروش؟
        </label>
      </div>
    </Card>
  );
}

function AmenitiesStep({ form: { control } }: StepProps) {
  return (
    <Card>
      <Controller
        control={control}
        name="amenities"
        render={({ field }) => (
          <ChipGroup
            label="الخدمات"
            multiple
            options={(Object.keys(amenityLabels) as Amenity[]).map((v) => ({ value: v, label: amenityLabels[v] }))}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Card>
  );
}

const conditionToggles: { name: keyof AddPropertyForm["conditions"]; label: string }[] = [
  { name: "familiesOnly", label: "عائلات فقط؟" },
  { name: "studentsAllowed", label: "طلبة؟" },
  { name: "singlesAllowed", label: "أفراد؟" },
  { name: "foreignersAllowed", label: "أجانب؟" },
  { name: "childrenAllowed", label: "أطفال؟" },
  { name: "petsAllowed", label: "حيوانات أليفة؟" },
  { name: "smokingAllowed", label: "تدخين؟" },
];

function ConditionsStep({ form: { register } }: StepProps) {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-3">
        {conditionToggles.map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2 text-small text-body-text">
            <input type="checkbox" className="size-4 accent-[var(--color-primary)]" {...register(`conditions.${name}`)} />
            {label}
          </label>
        ))}
      </div>
      <InputField label="الحد الأدنى لمدة الإيجار (شهور)" type="number" inputMode="numeric" {...register("conditions.minLeaseMonths", { valueAsNumber: true })} />
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
        form.setValue("description", res.optimized, { shouldValidate: true });
        toast("success", `تم تحسين الوصف — المتبقي: ${res.remainingUses}`);
      },
      onError: (err) => toast("error", err.exhausted ? "انتهت استخداماتك المجانية للتحسين" : err.message),
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-small font-semibold text-ink">الوصف</span>
        <Button type="button" variant="ghost" size="sm" onClick={runOptimize} loading={optimize.isPending}>
          <Sparkles className="size-4" aria-hidden />
          تحسين الوصف — Optimize with AI
        </Button>
      </div>
      <TextAreaField
        placeholder="اكتب وصفًا للعقار…"
        className="min-h-40"
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      <p className="text-caption text-muted">حوّل وصفك إلى نص تسويقي احترافي — استخدامات مجانية محدودة.</p>
    </Card>
  );
}
