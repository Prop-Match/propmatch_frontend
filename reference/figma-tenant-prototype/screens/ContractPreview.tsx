import { Download, ChevronRight, FileText } from 'lucide-react'

interface Props { onBack: () => void }

export function ContractPreview({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600">
              <ChevronRight size={18} />
              رجوع
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="font-bold text-slate-800">عقد الإيجار</span>
          </div>
          <button
            onClick={() => alert('سيتم تحميل العقد كملف PDF')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Download size={16} />
            تحميل العقد PDF
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Contract document */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Document header */}
          <div className="bg-slate-800 text-white text-center py-6 px-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText size={24} />
              <h1 className="text-xl font-extrabold">عقد إيجار سكني</h1>
            </div>
            <p className="text-slate-400 text-sm">جمهورية مصر العربية</p>
          </div>

          <div className="p-8 text-slate-800">
            {/* Preamble */}
            <p className="text-center text-sm text-slate-500 mb-6">
              بسم الله الرحمن الرحيم، تم إبرام هذا العقد بتاريخ <strong>1 فبراير 2024</strong>
            </p>

            <ContractSection title="أولًا: أطراف العقد">
              <ContractRow label="المالك (الطرف الأول)" value="أحمد محمد السيد" />
              <ContractRow label="الرقم القومي للمالك" value="••••••••1234" />
              <ContractRow label="المستأجر (الطرف الثاني)" value="محمد علي إبراهيم" />
              <ContractRow label="الرقم القومي للمستأجر" value="••••••••5678" />
            </ContractSection>

            <ContractSection title="ثانيًا: محل العقد">
              <ContractRow label="عنوان العقار" value="شقة 5، عمارة 12، شارع الجامعة، المنصورة الجديدة، المنصورة، الدقهلية" />
              <ContractRow label="نوع العقار" value="شقة سكنية مفروشة" />
              <ContractRow label="المساحة" value="90 م²" />
            </ContractSection>

            <ContractSection title="ثالثًا: مدة الإيجار والإيجار">
              <ContractRow label="تاريخ بداية الإيجار" value="1 فبراير 2024" />
              <ContractRow label="تاريخ انتهاء الإيجار" value="1 فبراير 2025" />
              <ContractRow label="الإيجار الشهري" value="4,500 ج.م" />
              <ContractRow label="موعد السداد" value="أول كل شهر ميلادي" />
            </ContractSection>

            <ContractSection title="رابعًا: شروط العقد">
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>1. يلتزم المستأجر بسداد الإيجار في موعده المحدد.</p>
                <p>2. يحظر على المستأجر التنازل عن هذا العقد أو تأجير العقار من الباطن دون موافقة خطية من المالك.</p>
                <p>3. يلتزم المستأجر بالحفاظ على العقار وإعادته بالحالة التي استلمه عليها.</p>
                <p>4. يُحق للمالك فسخ العقد في حالة عدم سداد الإيجار لمدة شهرين متتاليين.</p>
                <p>5. تُحسم قيمة أي تلفيات من مبلغ التأمين المدفوع.</p>
              </div>
            </ContractSection>

            {/* Signature area */}
            <div className="mt-8 grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="font-bold text-slate-700 mb-1">توقيع المالك</p>
                <p className="text-sm text-slate-500 mb-8">أحمد محمد السيد</p>
                <div className="border-b border-slate-300 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700 mb-1">توقيع المستأجر</p>
                <p className="text-sm text-slate-500 mb-8">محمد علي إبراهيم</p>
                <div className="border-b border-slate-300 h-8" />
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              هذا العقد مُنشأ بواسطة PropMatch AI · التوقيع يتم خارج المنصة
            </p>
          </div>
        </div>

        {/* Download CTA */}
        <div className="mt-5 text-center">
          <button
            onClick={() => alert('سيتم تحميل العقد كملف PDF')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 mx-auto text-base"
          >
            <Download size={18} />
            تحميل العقد PDF
          </button>
          <p className="text-xs text-slate-400 mt-2">ملف PDF جاهز للطباعة والتوقيع</p>
        </div>
      </div>
    </div>
  )
}

function ContractSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-bold text-slate-800 text-base mb-3 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm py-1.5">
      <span className="text-slate-500 shrink-0">{label}:</span>
      <span className="text-slate-800 font-medium text-left">{value}</span>
    </div>
  )
}
