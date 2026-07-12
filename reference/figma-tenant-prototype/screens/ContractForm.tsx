import { useState } from 'react'
import { FileText, ChevronRight } from 'lucide-react'

interface Props {
  onPreview: () => void
  onBack: () => void
}

export function ContractForm({ onPreview, onBack }: Props) {
  const [form, setForm] = useState({
    landlordName: 'أحمد محمد السيد',
    tenantName: 'محمد علي إبراهيم',
    landlordId: '••••••••1234',
    tenantId: '••••••••5678',
    rent: '4500',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    address: 'شقة 5، عمارة 12، شارع الجامعة، المنصورة الجديدة، المنصورة، الدقهلية',
    extraClauses: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600">
            <ChevronRight size={18} />
            رجوع
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-bold text-slate-800">إنشاء عقد إيجار</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">بيانات عقد الإيجار</h1>
            <p className="text-xs text-slate-500">أدخل البيانات لإنشاء عقد إيجار رسمي</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <FormSection title="بيانات المالك">
            <FormField label="اسم المالك" value={form.landlordName} onChange={set('landlordName')} />
            <FormField label="الرقم القومي للمالك (مُخفى)" value={form.landlordId} onChange={set('landlordId')} note="آخر 4 أرقام فقط" />
          </FormSection>

          <div className="h-px bg-slate-100" />

          <FormSection title="بيانات المستأجر">
            <FormField label="اسم المستأجر" value={form.tenantName} onChange={set('tenantName')} />
            <FormField label="الرقم القومي للمستأجر (مُخفى)" value={form.tenantId} onChange={set('tenantId')} note="آخر 4 أرقام فقط" />
          </FormSection>

          <div className="h-px bg-slate-100" />

          <FormSection title="بيانات العقد">
            <FormField label="الإيجار الشهري (ج.م)" value={form.rent} onChange={set('rent')} type="number" />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="تاريخ البداية" value={form.startDate} onChange={set('startDate')} type="date" />
              <FormField label="تاريخ الانتهاء" value={form.endDate} onChange={set('endDate')} type="date" />
            </div>
          </FormSection>

          <div className="h-px bg-slate-100" />

          <FormSection title="العنوان الكامل">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">العنوان التفصيلي للعقار</label>
              <textarea
                value={form.address}
                onChange={set('address')}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none"
              />
            </div>
          </FormSection>

          <div className="h-px bg-slate-100" />

          <FormSection title="بنود إضافية متفق عليها">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                بنود إضافية متفق عليها
                <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
              </label>
              <textarea
                value={form.extraClauses}
                onChange={set('extraClauses')}
                rows={4}
                placeholder="أضف أي شروط أو بنود إضافية متفق عليها بين الطرفين..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none"
              />
            </div>
          </FormSection>

          <button
            onClick={onPreview}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            معاينة العقد
          </button>
        </div>
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', note }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; note?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">
        {label}
        {note && <span className="text-xs text-slate-400 font-normal mr-1">({note})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
        dir={type === 'date' || type === 'number' ? 'ltr' : 'rtl'}
      />
    </div>
  )
}
