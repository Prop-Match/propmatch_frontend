import { useState } from 'react'
import { Check, X, ChevronRight, ScanFace, ScanLine } from 'lucide-react'

interface Props { onBack: () => void }

export function AdminUserReview({ onBack }: Props) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
          <ChevronRight size={18} />
          رجوع
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <span className="font-bold">مراجعة التوثيق (eKYC)</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {decision && (
          <div className={`rounded-2xl p-4 mb-5 border flex items-center gap-3 ${decision === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {decision === 'approved' ? <Check size={18} /> : <X size={18} />}
            <span className="font-semibold">{decision === 'approved' ? 'تم قبول التوثيق — الحساب موثّق' : 'تم رفض التوثيق'}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
          <h2 className="font-bold text-slate-800 mb-4">بيانات المستخدم</h2>
          <div className="space-y-2 text-sm mb-5">
            <Row label="الاسم المستخرج" val="نور سامي إبراهيم" />
            <Row label="الرقم القومي" val="••••••••4321" />
            <Row label="تاريخ الميلاد" val="15/08/1995" />
            <Row label="درجة الثقة" val="94%" highlight="green" />
          </div>

          {/* ID images */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-xs font-medium text-slate-600">
                <ScanLine size={12} />
                وجه البطاقة الأمامي
              </div>
              <div className="h-24 flex items-center justify-center">
                <ScanLine size={32} className="text-slate-300" />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-xs font-medium text-slate-600">
                <ScanLine size={12} />
                وجه البطاقة الخلفي
              </div>
              <div className="h-24 flex items-center justify-center">
                <ScanLine size={32} className="text-slate-300" />
              </div>
            </div>
          </div>

          {/* Selfie */}
          <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-xs font-medium text-slate-600">
              <ScanFace size={12} />
              الصورة الشخصية (تحقق حي)
            </div>
            <div className="h-28 flex items-center justify-center">
              <ScanFace size={40} className="text-slate-300" />
            </div>
          </div>

          {/* Match confidence */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 font-medium">تطابق الوجه مع البطاقة</span>
              <span className="text-green-700 font-extrabold text-lg">94%</span>
            </div>
            <div className="w-full h-2 bg-green-100 rounded-full mt-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
            </div>
          </div>
        </div>

        {!decision ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDecision('approved')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              موافقة
            </button>
            <button
              onClick={() => setDecision('rejected')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              رفض
            </button>
          </div>
        ) : (
          <button onClick={onBack} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
            العودة للقائمة
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, val, highlight }: { label: string; val: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight === 'green' ? 'text-green-600' : 'text-slate-800'}`}>{val}</span>
    </div>
  )
}
