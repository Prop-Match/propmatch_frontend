import { Bell, Check, X, Clock, User, Building2, ScanFace } from 'lucide-react'
import type { Screen } from '../types'

interface Props { onNav: (s: Screen) => void }

const PROPERTY_QUEUE = [
  { id: 1, title: 'شقة واسعة في المنصورة الجديدة', owner: 'خالد محمود', time: 'الآن', isNew: true },
  { id: 2, title: 'دور أرضي - شارع العمل', owner: 'سعيد عبد الرحمن', time: 'منذ 5 دقائق', isNew: true },
  { id: 3, title: 'استوديو مفروش - وسط البلد', owner: 'منى حسن', time: 'منذ 20 دقيقة', isNew: false },
  { id: 4, title: 'شقة 4 غرف - حي الجامعيين', owner: 'أيمن فتحي', time: 'منذ ساعة', isNew: false },
]

const KYC_QUEUE = [
  { id: 1, name: 'نور سامي إبراهيم', confidence: 94, time: 'الآن', isNew: true },
  { id: 2, name: 'عمر طارق علي', confidence: 87, time: 'منذ 3 دقائق', isNew: true },
  { id: 3, name: 'هبة محمد عبد الله', confidence: 72, time: 'منذ 15 دقيقة', isNew: false },
]

export function AdminDashboard({ onNav }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin nav */}
      <nav className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 7v9h4v-5h4v5h4V7L9 2z" fill="white" />
              </svg>
            </div>
            <span className="font-bold">PropMatch AI</span>
            <span className="text-slate-400 text-sm">— لوحة المشرف</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-800 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">5</span>
            </button>
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User size={14} />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <AdminStat label="طلبات توثيق جديدة" value="3" color="bg-blue-50 text-blue-700" />
          <AdminStat label="عقارات قيد المراجعة" value="4" color="bg-amber-50 text-amber-700" />
          <AdminStat label="تمت الموافقة اليوم" value="12" color="bg-green-50 text-green-700" />
          <AdminStat label="مرفوض اليوم" value="2" color="bg-red-50 text-red-700" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Property review queue */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-amber-600" />
                مراجعة العقارات
              </h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                {PROPERTY_QUEUE.length} قيد المراجعة
              </span>
            </div>
            <div className="space-y-3">
              {PROPERTY_QUEUE.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border shadow-sm p-4 ${item.isNew ? 'border-teal-200 bg-teal-50/30' : 'border-slate-100'}`}
                >
                  {item.isNew && (
                    <span className="inline-block text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold mb-2">طلب جديد بحاجة لمراجعة</span>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.owner} · {item.time}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onNav('admin-property-review')}
                        className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center justify-center transition-colors">
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => onNav('admin-property-review')}
                        className="px-3 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors"
                      >
                        مراجعة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KYC review queue */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ScanFace size={18} className="text-blue-600" />
                مراجعة التوثيق (eKYC)
              </h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200">
                {KYC_QUEUE.length} بانتظار المراجعة
              </span>
            </div>
            <div className="space-y-3">
              {KYC_QUEUE.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border shadow-sm p-4 ${item.isNew ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'}`}
                >
                  {item.isNew && (
                    <span className="inline-block text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold mb-2">طلب جديد بحاجة لمراجعة</span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        {item.time}
                        <span className={`mr-2 font-medium ${item.confidence >= 90 ? 'text-green-600' : item.confidence >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                          ثقة {item.confidence}%
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => onNav('admin-user-review')}
                        className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center justify-center transition-colors">
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => onNav('admin-user-review')}
                        className="px-3 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors"
                      >
                        مراجعة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color} border border-current/10`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}
