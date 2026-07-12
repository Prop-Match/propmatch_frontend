import { useState } from 'react'
import { Bell, ChevronDown, Home, Search, Building2, Settings, ShieldCheck, User } from 'lucide-react'
import type { Screen, UserRole } from '../../types'

interface NavBarProps {
  role: UserRole
  onNav: (s: Screen) => void
  onSwitchRole: (r: UserRole) => void
  notifCount?: number
}

export function NavBar({ role, onNav, onSwitchRole, notifCount = 2 }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const roleMeta = {
    tenant: { label: 'مستأجر', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    landlord: { label: 'مالك', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    admin: { label: 'مشرف', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  }

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => onNav('dashboard')} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 7v9h4v-5h4v5h4V7L9 2z" fill="white" />
              <circle cx="12.5" cy="5.5" r="2" fill="#99f6e4" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">PropMatch <span className="text-teal-600">AI</span></span>
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {role === 'tenant' && <>
            <NavLink icon={<Search size={15} />} label="بحث" onClick={() => onNav('tenant-browse')} />
            <NavLink icon={<Home size={15} />} label="مطابقة ذكية" onClick={() => onNav('tenant-match-form')} />
          </>}
          {role === 'landlord' && <>
            <NavLink icon={<Building2 size={15} />} label="عقاراتي" onClick={() => onNav('landlord-dashboard')} />
          </>}
          {role === 'admin' && <>
            <NavLink icon={<ShieldCheck size={15} />} label="لوحة المشرف" onClick={() => onNav('admin-dashboard')} />
          </>}
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          {role === 'admin' && (
            <button className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Bell size={20} className="text-slate-600" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{notifCount}</span>
              )}
            </button>
          )}

          {/* Role badge + profile menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-teal-700" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roleMeta[role].color}`}>{roleMeta[role].label}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <button onClick={() => { onNav('profile'); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <Settings size={14} className="text-slate-400" />
                  الملف الشخصي والإعدادات
                </button>
                <div className="h-px bg-slate-100 my-1" />
                {role !== 'tenant' && (
                  <button onClick={() => { onSwitchRole('tenant'); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <Search size={14} className="text-teal-500" />
                    التبديل لحساب المستأجر
                  </button>
                )}
                {role !== 'landlord' && (
                  <button onClick={() => { onSwitchRole('landlord'); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <Building2 size={14} className="text-blue-500" />
                    التبديل لحساب المالك
                  </button>
                )}
                {role !== 'admin' && (
                  <button onClick={() => { onSwitchRole('admin'); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <ShieldCheck size={14} className="text-purple-500" />
                    دخول كمشرف (تجريبي)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
    >
      {icon}
      {label}
    </button>
  )
}
