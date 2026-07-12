import { useState } from 'react'
import { Building2, Plus, TrendingUp, Users, Bell, ChevronLeft } from 'lucide-react'
import type { Screen, UserRole, AppState } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { StatusChip } from '../components/shared/Badge'

interface Props {
  onNav: (s: Screen) => void
  role: UserRole
  onSwitchRole: (r: UserRole) => void
  openPayment: (ctx: AppState['paymentContext']) => void
  isKycVerified: boolean
  publishSuccess?: boolean
  boostMode?: boolean
}

const MY_PROPERTIES = [
  { id: 1, title: 'شقة مفروشة في المنصورة الجديدة', neighborhood: 'المنصورة الجديدة', price: 4500, status: 'approved' as const, inquiries: 7, boosted: true },
  { id: 2, title: 'شقة واسعة قرب جامعة المنصورة', neighborhood: 'الجامعة', price: 3200, status: 'pending' as const, inquiries: 2, boosted: false },
  { id: 3, title: 'دور أرضي هادئ', neighborhood: 'حي الجامعيين', price: 2800, status: 'rejected' as const, inquiries: 0, boosted: false },
]

export function LandlordDashboard({ onNav, role, onSwitchRole, openPayment, isKycVerified, publishSuccess, boostMode }: Props) {
  const [showKycPrompt] = useState(!isKycVerified)

  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Success toast */}
        {publishSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Bell size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">تم إرسال الإعلان للمراجعة</p>
              <p className="text-xs text-green-700">سيتم مراجعة إعلانك خلال 24 ساعة</p>
            </div>
          </div>
        )}

        {/* KYC prompt */}
        {showKycPrompt && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 text-sm">التحقق من الهوية مطلوب لإضافة عقارات</p>
              <p className="text-xs text-amber-700 mt-0.5">أكمل eKYC أولًا لتتمكن من إضافة إعلاناتك</p>
            </div>
            <button onClick={() => onNav('kyc-id-front')} className="shrink-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-700">
              إكمال التوثيق
            </button>
          </div>
        )}

        {/* First listing free banner */}
        <div className="bg-gradient-to-l from-teal-600 to-teal-500 text-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-lg">إدارة عقاراتي</p>
            <p className="text-teal-100 text-sm mt-0.5">أول إعلان ليك مجانًا!</p>
          </div>
          <button
            onClick={() => onNav('add-property')}
            className="shrink-0 bg-white hover:bg-teal-50 text-teal-700 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            إضافة عقار
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="إجمالي العقارات" value="3" icon={<Building2 size={18} className="text-teal-600" />} />
          <StatCard label="استفسارات جديدة" value="9" icon={<Users size={18} className="text-blue-600" />} />
          <StatCard label="إعلانات مميّزة" value="1" icon={<TrendingUp size={18} className="text-amber-600" />} />
        </div>

        {/* Properties list */}
        <h2 className="font-bold text-slate-800 mb-3">عقاراتي</h2>
        <div className="space-y-3">
          {MY_PROPERTIES.map(prop => (
            <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight">{prop.title}</h3>
                  <StatusChip status={prop.status} />
                  {prop.boosted && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">إعلان مميّز</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{prop.neighborhood} · {prop.price.toLocaleString()} ج.م / شهريًا</p>
                {prop.inquiries > 0 && (
                  <p className="text-xs text-teal-600 font-medium mt-1">{prop.inquiries} استفسار</p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {prop.status === 'approved' && (
                  <button
                    onClick={() => onNav('landlord-inquiries')}
                    className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-100 transition-colors flex items-center gap-1"
                  >
                    <Users size={12} />
                    الاستفسارات
                  </button>
                )}
                <button
                  onClick={() => openPayment('boost')}
                  className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <TrendingUp size={12} />
                  تمييز الإعلان
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Boost CTA if in boost mode */}
        {boostMode && (
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-800">تمييز الإعلان</p>
              <p className="text-sm text-amber-700 mt-0.5">احصل على مزيد من الظهور وأسرع في إيجاد المستأجر المناسب</p>
            </div>
            <button onClick={() => openPayment('boost')} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
              <TrendingUp size={15} />
              تمييز الإعلان - 49 ج.م
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-xl font-extrabold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
      </div>
    </div>
  )
}
