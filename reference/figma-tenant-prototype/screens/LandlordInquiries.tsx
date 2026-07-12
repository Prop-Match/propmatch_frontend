import { FileText, ChevronRight } from 'lucide-react'
import { VerifiedBadge, MatchScore } from '../components/shared/Badge'

interface Props {
  onContract: () => void
  onBack: () => void
}

const INQUIRIES = [
  { id: 1, name: 'محمد علي إبراهيم', date: '12 يناير 2024', matchScore: 92, verified: true, note: 'مهندس، يبحث لمدة سنة' },
  { id: 2, name: 'سارة أحمد حسن', date: '11 يناير 2024', matchScore: 85, verified: true, note: 'طالبة دكتوراه في الجامعة' },
  { id: 3, name: 'كريم محمود عبد الله', date: '10 يناير 2024', matchScore: 74, verified: false, note: 'موظف، مع أسرة صغيرة' },
]

export function LandlordInquiries({ onContract, onBack }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600">
            <ChevronRight size={18} />
            رجوع
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-bold text-slate-800">المستأجرون المهتمون</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-teal-800">شقة مفروشة في المنصورة الجديدة</p>
          <p className="text-xs text-teal-600 mt-0.5">{INQUIRIES.length} مستأجر مهتم · مرتبون حسب نسبة التطابق</p>
        </div>

        <div className="space-y-4">
          {INQUIRIES.map(inq => (
            <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg shrink-0">
                {inq.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-slate-800">{inq.name}</span>
                  {inq.verified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-xs text-slate-500">{inq.note}</p>
                <p className="text-xs text-slate-400 mt-0.5">{inq.date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <MatchScore score={inq.matchScore} size={48} />
                <button
                  onClick={onContract}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FileText size={13} />
                  إنشاء عقد
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
