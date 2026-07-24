"use client";

import { Button } from "@/src/components/ui/Button";
import { ChipGroup } from "@/src/components/ui/Chip";
import { InputField, SelectField, TextAreaField } from "@/src/components/ui/Field";
import { QuotaChip } from "@/src/components/ui/QuotaChip";
import { useToast } from "@/src/components/ui/Toast";
import { useActiveRegions } from "@/src/features/admin/hooks/useRegions";
import { VerificationGate } from "@/src/features/ekyc/components/VerificationGate";
import { PaymentSheet } from "@/src/features/payments/PaymentSheet";
import type { ActionError } from "@/src/lib/api/actionError";
import type { PaymentType } from "@/src/lib/api/contracts/payment";
import { propertyTypeLabels, type PropertyType } from "@/src/lib/api/contracts/property";
import { cn } from "@/src/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Sparkles, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { useCreateProperty, useQuota, useStreamOptimizeDescription } from "../hooks/useLandlord";
import { addPropertyFormSchema, stepFields, type AddPropertyForm } from "../validation/schemas";

const steps = ["الموقع", "النوع", "التفاصيل", "الوصف"] as const;
type StepKey = keyof typeof stepFields;
const stepKeys: StepKey[] = ["location", "type", "details", "description"];
const PROPERTY_DRAFT_STORAGE_KEY = "propmatch:add-property-draft";

type PropertyDraft = {
  step: number;
  values: Partial<AddPropertyForm>;
};

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
  return (
    <VerificationGate verificationPath="/landlord/verify">
      <AddPropertyWizardContent />
    </VerificationGate>
  );
}

function AddPropertyWizardContent() {
  const router = useRouter();
  const toast = useToast();
  const quota = useQuota();
  const form = useForm<AddPropertyForm>({
    resolver: zodResolver(addPropertyFormSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const [step, setStep] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const create = useCreateProperty();
  const [paywall, setPaywall] = useState<PaymentType | null>(null);

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft) as PropertyDraft;
        if (draft.values && typeof draft.step === "number") {
          form.reset({ ...defaults, ...draft.values });
          setStep(Math.max(0, Math.min(draft.step, steps.length - 1)));
        }
      }
    } catch {
      window.localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
    } finally {
      setDraftRestored(true);
    }
  }, [form]);

  useEffect(() => {
    if (!draftRestored) return;

    const saveDraft = (values: Partial<AddPropertyForm>) => {
      const valuesToPersist = { ...values };
      delete valuesToPersist.images;
      const draft: PropertyDraft = { step, values: valuesToPersist };
      try {
        window.localStorage.setItem(
          PROPERTY_DRAFT_STORAGE_KEY,
          JSON.stringify(draft),
        );
      } catch {
        // A full or unavailable browser storage must not block form use.
      }
    };
    saveDraft(form.getValues());
    const subscription = form.watch((values) => {
      saveDraft(values);
    });
    return () => subscription.unsubscribe();
  }, [draftRestored, form, step]);

  async function next() {
    const fields = stepFields[stepKeys[step]] as unknown as (keyof AddPropertyForm)[];
    if (await form.trigger(fields)) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function submit(values: AddPropertyForm) {
    create.mutate(values, {
      onSuccess: () => {
        window.localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
        // ERD: PROPERTY.status defaults to PENDING — admin must approve (PRO-04).
        toast("success", "تم إرسال إعلانك للمراجعة");
        router.push("/landlord");
      },
      onError: (e) => {
        if (e.code === "VERIFICATION_REQUIRED") {
          toast("info", e.message);
        } else if (e.code === "QUOTA_EXHAUSTED") {
          setPaywall(e.paymentType ?? "NEW_LISTING");
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

function LocationStep({ form: { watch, setValue, register, formState: { errors } } }: StepProps) {
  const { data: activeCountries, isLoading } = useActiveRegions();

  const selectedGovName = watch("governorate");
  const selectedCityName = watch("city");

  // Filter active governorates across active countries
  const activeGovernorates =
    activeCountries?.flatMap((c) => c.governorates.filter((g) => g.status)) ?? [];

  // Find currently selected governorate
  const currentGov = activeGovernorates.find(
    (g) => g.nameAr === selectedGovName || g.nameEn === selectedGovName
  );

  // Active cities under selected governorate
  const activeCities = currentGov?.cities.filter((city) => city.status) ?? [];

  // Find currently selected city
  const currentCity = activeCities.find(
    (c) => c.nameAr === selectedCityName || c.nameEn === selectedCityName
  );

  // Active districts under selected city
  const activeDistricts = currentCity?.districts?.filter((d) => d.status) ?? [];

  const govOptions = activeGovernorates.map((g) => ({
    value: g.nameAr,
    label: `${g.nameAr} (${g.nameEn})`,
  }));

  const cityOptions = activeCities.map((c) => ({
    value: c.nameAr,
    label: `${c.nameAr} (${c.nameEn})`,
  }));

  const districtOptions = activeDistricts.map((d) => ({
    value: d.nameAr,
    label: `${d.nameAr} (${d.nameEn})`,
  }));

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGov = e.target.value;
    setValue("governorate", newGov, { shouldValidate: true });

    const newGovObj = activeGovernorates.find(
      (g) => g.nameAr === newGov || g.nameEn === newGov
    );
    const firstCityObj = newGovObj?.cities.filter((c) => c.status)[0];
    const firstCity = firstCityObj?.nameAr ?? "";
    setValue("city", firstCity, { shouldValidate: true });

    const firstDistrict = firstCityObj?.districts?.filter((d) => d.status)[0]?.nameAr ?? "";
    setValue("district", firstDistrict, { shouldValidate: true });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setValue("city", newCity, { shouldValidate: true });

    const newCityObj = activeCities.find(
      (c) => c.nameAr === newCity || c.nameEn === newCity
    );
    const firstDistrict = newCityObj?.districts?.filter((d) => d.status)[0]?.nameAr ?? "";
    setValue("district", firstDistrict, { shouldValidate: true });
  };

  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="المحافظة"
          options={govOptions}
          placeholder={isLoading ? "جاري تحميل المحافظات..." : "اختر المحافظة"}
          value={selectedGovName}
          onChange={handleGovChange}
          error={errors.governorate?.message}
        />
        <SelectField
          label="المدينة"
          options={cityOptions}
          placeholder={
            isLoading
              ? "جاري تحميل المدن..."
              : !selectedGovName
              ? "اختر المحافظة أولاً"
              : cityOptions.length === 0
              ? "لا يوجد مدن متاحة"
              : "اختر المدينة"
          }
          value={selectedCityName}
          onChange={handleCityChange}
          error={errors.city?.message}
          disabled={!selectedGovName || cityOptions.length === 0}
        />
      </div>
      {districtOptions.length > 0 ? (
        <SelectField
          label="الحي / المنطقة"
          options={districtOptions}
          placeholder="اختر الحي / المنطقة"
          {...register("district")}
          error={errors.district?.message}
        />
      ) : (
        <InputField
          label="الحي / المنطقة"
          placeholder="مثال: حي الجامعة"
          {...register("district")}
          error={errors.district?.message}
        />
      )}
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
  const optimize = useStreamOptimizeDescription();
  const description = form.watch("description");
  // PRO-10 says the landlord reviews the rewrite — so keep what they wrote and
  // let them put it back. Streaming overwrites the field in place, which would
  // otherwise destroy their draft with no way back.
  const [previous, setPrevious] = useState<string | null>(null);

  async function runOptimize() {
    const original = description || "عقار للإيجار";
    setPrevious(original);
    const { description: _desc, images: _images, ...context } = form.getValues();
    try {
      await optimize.run(original, context, (soFar) =>
        form.setValue("description", soFar, { shouldValidate: false }),
      );
      form.trigger("description");
      toast("success", "تم تحسين الوصف — راجعه قبل الإرسال");
    } catch (e) {
      const err = e as ActionError;
      // Put their text back: a failed rewrite must not cost them their draft.
      form.setValue("description", original, { shouldValidate: true });
      setPrevious(null);
      toast("error", err.code === "QUOTA_EXHAUSTED" ? "انتهت استخداماتك المجانية للتحسين" : err.message);
    }
  }

  function undo() {
    if (previous === null) return;
    form.setValue("description", previous, { shouldValidate: true });
    setPrevious(null);
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-small font-semibold text-ink">الوصف</span>
        <div className="flex items-center gap-1">
          {previous !== null && !optimize.isStreaming && (
            <Button type="button" variant="ghost" size="sm" onClick={undo}>
              <Undo2 className="size-4" aria-hidden />
              تراجع
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={runOptimize}
            loading={optimize.isStreaming}
            disabled={optimize.isStreaming}
          >
            <Sparkles className="size-4" aria-hidden />
            تحسين الوصف بالذكاء الاصطناعي
          </Button>
        </div>
      </div>
      <TextAreaField
        placeholder="اكتب وصفًا للعقار…"
        className="min-h-40"
        error={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      {optimize.isStreaming && (
        <p className="flex items-center gap-1.5 text-caption text-muted" role="status">
          <Sparkles className="size-3.5 animate-pulse" aria-hidden />
          جارٍ كتابة الوصف…
        </p>
      )}
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
      <input type="checkbox" className="size-4 accent-primary" {...rest} />
      {label}
    </label>
  );
};
