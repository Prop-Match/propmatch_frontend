import { useState } from 'react'
import { Eye, EyeOff, Phone, Mail, Lock, ChevronRight } from 'lucide-react'
import type { UserRole } from '../types'

interface Props {
  onLogin: (role: UserRole) => void
  onBack: () => void
}

export function AuthScreen({ onLogin, onBack }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ email: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState<UserRole>('tenant')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(role)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 7v9h4v-5h4v5h4V7L9 2z" fill="white" />
                <circle cx="12.5" cy="5.5" r="2" fill="#99f6e4" />
              </svg>
            </div>
            <span className="font-extrabold text-xl text-slate-800">PropMatch <span className="text-teal-600">AI</span></span>
          </div>
          <p className="text-slate-500 text-sm">أجر بيتك أو اسكن مباشرة. بدون سمسار، وبدون عمولة.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
              إنشاء حساب
            </button>
          </div>

          {/* Demo role selector */}
          <div className="mb-5 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-2">للتجربة — اختر دور الدخول:</p>
            <div className="flex gap-2">
              {(['tenant','landlord','admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${role === r ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {r === 'tenant' ? 'مستأجر' : r === 'landlord' ? 'مالك' : 'مشرف'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  dir="ltr"
                />
                <Mail size={16} className="absolute right-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                    dir="ltr"
                  />
                  <Phone size={16} className="absolute right-3 top-3.5 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 pl-10 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  dir="ltr"
                />
                <Lock size={16} className="absolute right-3 top-3.5 text-slate-400" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute left-3 top-3.5 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </form>
        </div>

        <button onClick={onBack} className="mt-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto">
          <ChevronRight size={16} />
          العودة للرئيسية
        </button>
      </div>
    </div>
  )
}
