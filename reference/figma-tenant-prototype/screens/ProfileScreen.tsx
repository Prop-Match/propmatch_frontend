import { BadgeCheck, ShieldCheck, Search, Building2, Mail, Phone, User } from 'lucide-react'
import type { Screen, UserRole } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { VerifiedBadge } from '../components/shared/Badge'

interface Props {
  isKycVerified: boolean
  role: UserRole
  onNav: (s: Screen) => void
  onSwitchRole: (r: UserRole) => void
}

export function ProfileScreen({ isKycVerified, role, onNav, onSwitchRole }: Props) {
  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-extrabold text-2xl">
              م
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">محمد أحمد إبراهيم</h2>
              <p className="text-slate-500 text-sm">عضو منذ يناير 2024</p>
              <div className="mt-1">
                {isKycVerified ? <VerifiedBadge size="sm" /> : (
                  <span className="text-xs text-amber-600 font-medium">الهوية غير موثّقة</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <InfoRow icon={<Mail size={14} className="text-slate-400" />} label="البريد الإلكتروني" val="user@example.com" />
            <InfoRow icon={<Phone size={14} className="text-slate-400" />} label="رقم الهاتف" val="010xxxxxxxx" />
            <InfoRow icon={<User size={14} className="text-slate-400" />} label="الرقم القومي" val="••••••••1234" />
          </div>
        </div>

        {/* KYC status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-600" />
            حالة التوثيق (eKYC)
          </h3>
          {isKycVerified ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <BadgeCheck size={20} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800 text-sm">هوية موثّقة</p>
                <p className="text-xs text-green-700">تم التحقق من هويتك بنجاح</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <p className="font-semibold text-amber-800 text-sm">الهوية غير موثّقة</p>
                <p className="text-xs text-amber-700">أكمل التوثيق لإضافة عقارات</p>
              </div>
              <button
                onClick={() => onNav('kyc-id-front')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                توثيق الآن
              </button>
            </div>
          )}
        </div>

        {/* Context switch */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-slate-800 mb-4">تبديل دور الحساب</h3>
          <p className="text-xs text-slate-500 mb-3">حسابك موحّد — يمكنك التبديل بين دور المستأجر والمالك في أي وقت.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { onSwitchRole('tenant'); onNav('tenant-browse') }}
              className={`p-4 rounded-xl border-2 text-right transition-all ${role === 'tenant' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
            >
              <Search size={20} className="text-teal-600 mb-1" />
              <p className="font-bold text-slate-800 text-sm">مستأجر</p>
              <p className="text-xs text-slate-500">البحث عن عقار</p>
              {role === 'tenant' && <p className="text-xs text-teal-600 font-medium mt-1">الوضع الحالي</p>}
            </button>
            <button
              onClick={() => { onSwitchRole('landlord'); onNav('landlord-dashboard') }}
              className={`p-4 rounded-xl border-2 text-right transition-all ${role === 'landlord' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <Building2 size={20} className="text-blue-600 mb-1" />
              <p className="font-bold text-slate-800 text-sm">مالك</p>
              <p className="text-xs text-slate-500">إدارة العقارات</p>
              {role === 'landlord' && <p className="text-xs text-blue-600 font-medium mt-1">الوضع الحالي</p>}
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-3">روابط سريعة</h3>
          <div className="space-y-1">
            <QuickAction label="البحث عن عقار" onClick={() => onNav('tenant-browse')} />
            <QuickAction label="إدارة عقاراتي" onClick={() => onNav('landlord-dashboard')} />
            <QuickAction label="المطابقة الذكية" onClick={() => onNav('tenant-match-form')} />
            <QuickAction label="المساعد القانوني الذكي" onClick={() => onNav('legal-chatbot')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50">
      {icon}
      <span className="text-slate-500 text-sm w-32">{label}</span>
      <span className="text-slate-700 text-sm font-medium">{val}</span>
    </div>
  )
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors font-medium"
    >
      {label}
    </button>
  )
}
