"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { matchIntakeFormSchema, MANSOURA_NEIGHBORHOODS, type MatchIntakeForm } from "../validation/schemas";
import { InputField, SelectField, TextAreaField } from "@/src/components/ui/Field";
import { ChipGroup } from "@/src/components/ui/Chip";
import { Button } from "@/src/components/ui/Button";
import {
  lifestylePriorityLabels,
  lifestyleProfileLabels,
  type LifestylePriority,
  type LifestyleProfile,
} from "@/src/lib/api/contracts/match";
import { propertyTypeLabels } from "@/src/lib/api/contracts/property";

const DRAFT_KEY = "propmatch:match-intake-draft";

const defaults: Partial<MatchIntakeForm> = {
  budgetMin: 2000,
  budgetMax: 6000,
  neighborhoods: [],
  propertyType: "apartment",
  roomsNeeded: 2,
  furnished: "any",
  leaseDuration: "year",
  moveInDate: "",
  occupants: 1,
  maritalStatus: "single",
  hasChildren: false,
  hasPets: false,
  smoker: false,
  needsParking: false,
  needsInternet: true,
  needsAc: true,
  lifestylePriorities: [],
  lifestyleProfile: "employee",
  idealDescription: "",
};

export function MatchIntakeForm({ onSubmit, submitting }: { onSubmit: (v: MatchIntakeForm) => void; submitting: boolean }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MatchIntakeForm>({
    resolver: zodResolver(matchIntakeFormSchema),
    defaultValues: defaults,
  });

  // Draft autosave / restore (design spec: forms support draft saving).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(DRAFT_KEY) : null;
    if (saved) {
      try {
        reset({ ...defaults, ...JSON.parse(saved) });
      } catch {
        /* ignore malformed draft */
      }
    }
  }, [reset]);

  // RHF's documented draft-autosave pattern: subscribe to watch() in an
  // effect with cleanup. The React Compiler lint warning here is a known
  // false positive for this exact usage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = watch((value) => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {/* Budget */}
      <section className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-title font-bold text-ink">الميزانية</h2>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="أقل ميزانية"
            type="number"
            inputMode="numeric"
            error={errors.budgetMin?.message}
            {...register("budgetMin", { valueAsNumber: true })}
          />
          <InputField
            label="أعلى ميزانية"
            type="number"
            inputMode="numeric"
            error={errors.budgetMax?.message}
            {...register("budgetMax", { valueAsNumber: true })}
          />
        </div>
      </section>

      {/* Where + type */}
      <section className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
        <Controller
          control={control}
          name="neighborhoods"
          render={({ field }) => (
            <ChipGroup
              label="أين ترغب بالسكن؟"
              multiple
              options={MANSOURA_NEIGHBORHOODS.map((n) => ({ value: n, label: n }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.neighborhoods?.message}
            />
          )}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField
            label="نوع العقار"
            options={(["apartment", "room", "studio", "villa"] as const).map((t) => ({ value: t, label: propertyTypeLabels[t] }))}
            {...register("propertyType")}
          />
          <InputField label="عدد الغرف المطلوبة" type="number" inputMode="numeric" {...register("roomsNeeded", { valueAsNumber: true })} />
          <SelectField
            label="مفروش؟"
            options={[
              { value: "any", label: "لا يهم" },
              { value: "yes", label: "نعم" },
              { value: "no", label: "لا" },
            ]}
            {...register("furnished")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField
            label="مدة الإيجار"
            options={[
              { value: "under-year", label: "أقل من سنة" },
              { value: "year", label: "سنة" },
              { value: "over-year", label: "أكثر من سنة" },
            ]}
            {...register("leaseDuration")}
          />
          <InputField label="تاريخ الانتقال" type="date" {...register("moveInDate")} />
          <InputField label="عدد السكان" type="number" inputMode="numeric" {...register("occupants", { valueAsNumber: true })} />
        </div>
      </section>

      {/* Lifestyle */}
      <section className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-title font-bold text-ink">نمط الحياة</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="الحالة الاجتماعية"
            options={[
              { value: "single", label: "أعزب" },
              { value: "married", label: "متزوج" },
              { value: "family", label: "أسرة" },
            ]}
            {...register("maritalStatus")}
          />
          <SelectField
            label="كيف تصف نمط حياتك؟"
            options={(Object.keys(lifestyleProfileLabels) as LifestyleProfile[]).map((v) => ({
              value: v,
              label: lifestyleProfileLabels[v],
            }))}
            {...register("lifestyleProfile")}
          />
        </div>
        <Controller
          control={control}
          name="lifestylePriorities"
          render={({ field }) => (
            <ChipGroup
              label="ما الذي يهمك أكثر؟"
              multiple
              options={(Object.keys(lifestylePriorityLabels) as LifestylePriority[]).map((v) => ({
                value: v,
                label: lifestylePriorityLabels[v],
              }))}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex flex-wrap gap-4">
          <Toggle label="أطفال؟" {...register("hasChildren")} />
          <Toggle label="حيوانات أليفة؟" {...register("hasPets")} />
          <Toggle label="مدخن؟" {...register("smoker")} />
          <Toggle label="موقف سيارات؟" {...register("needsParking")} />
          <Toggle label="إنترنت؟" {...register("needsInternet")} />
          <Toggle label="تكييف؟" {...register("needsAc")} />
        </div>
      </section>

      {/* The star: open RAG field */}
      <section className="flex flex-col gap-3 rounded-card border-2 border-primary/30 bg-primary-tint/40 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <h2 className="text-title font-bold text-primary-dark">صف العقار المثالي بالنسبة لك</h2>
        </div>
        <p className="text-small text-body-text">
          اكتب بكلماتك ما تبحث عنه — الذكاء الاصطناعي يفهم تفضيلاتك ويحوّلها إلى نتائج مطابقة.
        </p>
        <TextAreaField
          placeholder="أبحث عن شقة هادئة قريبة من جامعة المنصورة، مفروشة، مناسبة لشخصين، وبها إنترنت جيد لأنني أعمل من المنزل."
          error={errors.idealDescription?.message}
          className="min-h-32 bg-surface"
          {...register("idealDescription")}
        />
      </section>

      <Button type="submit" size="lg" loading={submitting} className="self-stretch">
        <Sparkles className="size-4" aria-hidden />
        ابحث عن سكنك
      </Button>
    </form>
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
