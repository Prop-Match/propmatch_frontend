"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Download, ArrowRight } from "lucide-react";
import { CreateLeaseContractSchema, type CreateLeaseContract } from "@/src/lib/api/contracts/contract";
import { InputField, TextAreaField } from "@/src/components/ui/Field";
import { Button } from "@/src/components/ui/Button";
import { ContractPreview } from "./ContractPreview";

/**
 * Form → PDF only (SRS FR5, no conversational drafting). PDF is produced via
 * the browser print dialog on the preview — free feature, no backend call.
 */
export function ContractGenerator() {
  const [preview, setPreview] = useState<CreateLeaseContract | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLeaseContract>({ resolver: zodResolver(CreateLeaseContractSchema) });

  if (preview) {
    return <ContractPreview data={preview} onBack={() => setPreview(null)} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-h1 font-bold text-ink">
          <FileText className="size-6 text-primary" aria-hidden />
          إنشاء العقد
        </h1>
        <p className="mt-1 text-small text-muted">املأ البيانات لإنشاء عقد إيجار مصري قياسي جاهز للتحميل.</p>
      </div>

      <form onSubmit={handleSubmit(setPreview)} className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InputField label="اسم المالك" {...register("ownerName")} error={errors.ownerName?.message} />
          <InputField label="اسم المستأجر" {...register("tenantName")} error={errors.tenantName?.message} />
          <InputField label="الرقم القومي للمالك" inputMode="numeric" dir="ltr" {...register("ownerNationalId")} error={errors.ownerNationalId?.message} />
          <InputField label="الرقم القومي للمستأجر" inputMode="numeric" dir="ltr" {...register("tenantNationalId")} error={errors.tenantNationalId?.message} />
          <InputField label="الإيجار الشهري (ج.م)" type="number" inputMode="numeric" {...register("rentAmount", { valueAsNumber: true })} error={errors.rentAmount?.message} />
          <div />
          <InputField label="تاريخ البداية" type="date" {...register("startDate")} error={errors.startDate?.message} />
          <InputField label="تاريخ النهاية" type="date" {...register("endDate")} error={errors.endDate?.message} />
        </div>
        <InputField label="العنوان الكامل" {...register("propertyAddress")} error={errors.propertyAddress?.message} />
        <TextAreaField label="بنود إضافية متفق عليها" placeholder="أي شروط إضافية متفق عليها بين الطرفين…" {...register("customClauses")} />
        <Button type="submit" size="lg">
          معاينة العقد
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}

export { Download };
