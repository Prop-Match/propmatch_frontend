import { Search, Building2, BadgeCheck, ShieldCheck, ChevronLeft, Bell } from 'lucide-react'
import type { Screen, UserRole } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { VerifiedBadge } from '../components/shared/Badge'

interface Props {
  role: UserRole
  isKycVerified: boolean
  onNav: (s: Screen) => void
  onSwitchRole: (r: UserRole) => void
}

export function DashboardScreen({ role, isKycVerified, onNav, onSwitchRole }: Props) {
  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome card */}
        <div className="bg-gradient-to-l from-teal-600 to-teal-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1">أهلًا بك في</p>
              <h1 className="text-2xl font-extrabold mb-2">PropMatch AI</h1>
              <p className="text-teal-100 text-sm">أجر بيتك أو اسكن مباشرة. بدون سمسار، وبدون عمولة.</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 7v9h4v-5h4v5h4V7L9 2z" fill="white" />
              </svg>
            </div>
          </div>
          {/* eKYC status bar */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isKycVerified
                ? <><BadgeCheck size={16} className="text-green-300" /><span className="text-sm font-medium">هوية موثّقة</span></>
                : <><ShieldCheck size={16} className="text-amber-300" /><span className="text-sm font-medium">الهوية غير موثّقة</span></>
              }
            </div>
            {!isKycVerified && (
              <button
                onClick={() => onNav('kyc-id-front')}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                إكمال التوثيق
              </button>
            )}
          </div>
        </div>

        {/* eKYC prompt banner */}
        {!isKycVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Bell size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">أكمل التحقق من هويتك</p>
              <p className="text-xs text-amber-700 mt-0.5">التوثيق مطلوب لإضافة عقارات، ومستحسن للحصول على أفضل نتائج المطابقة.</p>
            </div>
            <button onClick={() => onNav('kyc-id-front')} className="shrink-0 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
              ابدأ الآن
            </button>
          </div>
        )}

        {/* Main CTAs */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <ActionCard
            icon={<Search size={28} className="text-teal-600" />}
            bg="bg-teal-50"
            title="البحث عن عقار"
            subtitle="كمستأجر"
            desc="ابحث في مئات العقارات الموثّقة، أو استخدم المطابقة الذكية."
            cta="اذهب للبحث"
            onClick={() => { onSwitchRole('tenant'); onNav('tenant-browse') }}
            accent="teal"
          />
          <ActionCard
            icon={<Building2 size={28} className="text-blue-600" />}
            bg="bg-blue-50"
            title="إدارة عقاراتي"
            subtitle="كمالك"
            desc="أضف عقاراتك، راجع الاستفسارات، وأنشئ عقود الإيجار."
            cta="إدارة العقارات"
            onClick={() => { onSwitchRole('landlord'); onNav('landlord-dashboard') }}
            accent="blue"
          />
        </div>

        {/* Verification status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">حالة حسابك</h2>
          <div className="space-y-3">
            <StatusRow label="البريد الإلكتروني" value="user@example.com" done />
            <StatusRow label="رقم الهاتف" value="01xxxxxxxxx" done />
            <StatusRow
              label="التحقق من الهوية (eKYC)"
              value={isKycVerified ? 'موثّق' : 'غير مكتمل'}
              done={isKycVerified}
              action={!isKycVerified ? { label: 'إكمال التوثيق', onClick: () => onNav('kyc-id-front') } : undefined}
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLink label="المطابقة الذكية" onClick={() => onNav('tenant-match-form')} />
          <QuickLink label="إضافة عقار" onClick={() => onNav('add-property')} />
          <QuickLink label="المساعد القانوني" onClick={() => onNav('legal-chatbot')} />
          <QuickLink label="الملف الشخصي" onClick={() => onNav('profile')} />
        </div>
      </div>
    </div>
  )
}

function ActionCard({ icon, bg, title, subtitle, desc, cta, onClick, accent }: {
  icon: React.ReactNode; bg: string; title: string; subtitle: string; desc: string; cta: string; onClick: () => void; accent: string
}) {
  const btnCls = accent === 'teal' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>{icon}</div>
      <div className="mb-1">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400 font-medium">{subtitle}</span>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
      <button onClick={onClick} className={`${btnCls} text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5`}>
        {cta} <ChevronLeft size={14} />
      </button>
    </div>
  )
}

function StatusRow({ label, value, done, action }: { label: string; value: string; done: boolean; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${done ? 'bg-green-500' : 'bg-amber-400'}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">{value}</span>
        {action && (
          <button onClick={action.onClick} className="text-xs text-teal-600 font-semibold hover:underline">
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white border border-slate-100 rounded-xl p-3 text-sm font-medium text-slate-600 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50 transition-all text-center shadow-sm">
      {label}
    </button>
  )
}
