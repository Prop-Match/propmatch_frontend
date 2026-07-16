"use client";

import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { formatEGP, formatDate } from "@/src/utils/format";
import type { CreateLeaseContract } from "@/src/lib/api/contracts/contract";

/**
 * Standard Egyptian lease rendered on screen. "تحميل العقد PDF" triggers the
 * browser print dialog scoped to the document (see the print stylesheet in
 * globals.css); the user picks "Save as PDF".
 *
 * Production path (SRS FR5.3): the backend renders this same template to PDF
 * server-side via Puppeteer/pdfkit and streams a real file — offloaded to an
 * async queue (NFR2.2). This client print flow is the interim mechanism until
 * that endpoint exists; swap the button handler for a download of the
 * server-generated PDF then (see ASSUMPTIONS.md).
 */
export function ContractPreview({ data, onBack }: { data: CreateLeaseContract; onBack: () => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" onClick={onBack}>
          <ArrowRight className="size-4" aria-hidden />
          تعديل البيانات
        </Button>
        <Button onClick={() => window.print()}>
          <Download className="size-4" aria-hidden />
          تحميل العقد PDF
        </Button>
      </div>
      <p className="text-caption text-muted print:hidden">
        اختر «حفظ بصيغة PDF» من نافذة الطباعة لتنزيل نسخة من العقد.
      </p>

      <article id="contract-document" className="flex flex-col gap-6 rounded-card border border-hairline bg-surface p-8 leading-loose shadow-card">
        <header className="border-b border-hairline pb-4 text-center">
          <h1 className="text-h1 font-bold text-ink">عقد إيجار</h1>
          <p className="text-small text-muted">جمهورية مصر العربية — عقد إيجار سكني</p>
        </header>

        <p className="text-body text-body-text">
          إنه في يوم {formatDate(new Date())}، تم الاتفاق بين كل من:
        </p>

        <div className="flex flex-col gap-2 text-body text-body-text">
          <p>
            <b className="text-ink">الطرف الأول (المالك):</b> {data.ownerName} — الرقم القومي:{" "}
            <span dir="ltr">{data.ownerNationalId}</span>
          </p>
          <p>
            <b className="text-ink">الطرف الثاني (المستأجر):</b> {data.tenantName} — الرقم القومي:{" "}
            <span dir="ltr">{data.tenantNationalId}</span>
          </p>
        </div>

        <section className="flex flex-col gap-2 text-body text-body-text">
          <p>
            <b className="text-ink">البند الأول:</b> أجّر الطرف الأول للطرف الثاني العقار الكائن في:{" "}
            {data.propertyAddress}.
          </p>
          <p>
            <b className="text-ink">البند الثاني:</b> مدة الإيجار من {formatDate(data.startDate)} حتى{" "}
            {formatDate(data.endDate)}.
          </p>
          <p>
            <b className="text-ink">البند الثالث:</b> قيمة الإيجار الشهري {formatEGP(data.rentAmount)}، تُدفع في بداية كل
            شهر.
          </p>
          {data.customClauses && (
            <p>
              <b className="text-ink">بنود إضافية متفق عليها:</b> {data.customClauses}
            </p>
          )}
        </section>

        <footer className="mt-6 grid grid-cols-2 gap-8 pt-6 text-center text-small text-body-text">
          <div>
            <p className="mb-8 font-bold text-ink">الطرف الأول (المالك)</p>
            <p className="border-t border-hairline pt-2">{data.ownerName}</p>
          </div>
          <div>
            <p className="mb-8 font-bold text-ink">الطرف الثاني (المستأجر)</p>
            <p className="border-t border-hairline pt-2">{data.tenantName}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
