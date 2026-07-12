import { useState } from 'react'
import { Check, X, ChevronRight, BedDouble, Bath, Ruler, Sofa, AlertCircle } from 'lucide-react'

interface Props { onBack: () => void }

export function AdminPropertyReview({ onBack }: Props) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
          <ChevronRight size={18} />
          رجوع
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <span className="font-bold">مراجعة الإعلان</span>
        <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium mr-auto">قيد المراجعة</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {decision && (
          <div className={`rounded-2xl p-4 mb-5 border flex items-center gap-3 ${decision === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {decision === 'approved' ? <Check size={18} /> : <X size={18} />}
            <span className="font-semibold">{decision === 'approved' ? 'تمت الموافقة على الإعلان' : 'تم رفض الإعلان'}</span>
          </div>
        )}

        {/* Property card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=300&fit=crop&auto=format"
            alt="صورة العقار"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-lg font-extrabold text-slate-800 mb-1">شقة واسعة في المنصورة الجديدة</h2>
            <p className="text-slate-500 text-sm mb-4">المنصورة الجديدة، المنصورة · 4,500 ج.م / شهريًا</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <StatBox icon={<BedDouble size={14} />} label="غرف" val="3" />
              <StatBox icon={<Bath size={14} />} label="حمّامات" val="2" />
              <StatBox icon={<Ruler size={14} />} label="مساحة" val="120 م²" />
              <StatBox icon={<Sofa size={14} />} label="التأثيث" val="مفروش" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">معلومات المالك</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">الاسم</span><span className="font-medium">خالد محمود أحمد</span></div>
                <div className="flex justify-between"><span className="text-slate-500">حالة التوثيق</span><span className="text-green-600 font-medium">هوية موثّقة</span></div>
                <div className="flex justify-between"><span className="text-slate-500">تاريخ التقديم</span><span>12 يناير 2024 - 10:30 ص</span></div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <p>الإعلانات المرفوضة لن تظهر للمستأجرين. يتلقى المالك إشعارًا بسبب الرفض.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!decision ? (
          <div className="space-y-3">
            <button
              onClick={() => setDecision('approved')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              موافقة — نشر الإعلان للمستأجرين
            </button>
            <div>
              <textarea
                placeholder="سبب الرفض (سيُرسل للمالك)..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none mb-2"
              />
              <button
                onClick={() => setDecision('rejected')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                رفض الإعلان
              </button>
            </div>
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

function StatBox({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
      <div className="flex justify-center text-teal-600 mb-1">{icon}</div>
      <p className="text-xs font-bold text-slate-700">{val}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  )
}
