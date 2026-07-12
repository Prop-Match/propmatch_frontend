import { useState, useEffect } from 'react'
import { Sparkles, CreditCard } from 'lucide-react'
import type { Screen, UserRole, AppState } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { PropertyCard, SAMPLE_PROPERTIES } from '../components/shared/PropertyCard'
import { QuotaChip } from '../components/shared/Badge'

interface Props {
  freeMatches: number
  onProperty: () => void
  onExhausted: () => void
  onNav: (s: Screen) => void
  role: UserRole
  onSwitchRole: (r: UserRole) => void
  openPayment: (ctx: AppState['paymentContext']) => void
  exhausted?: boolean
}

export function TenantMatchResults({ freeMatches, onProperty, onNav, role, onSwitchRole, openPayment, exhausted }: Props) {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t) }, [])

  const sorted = [...SAMPLE_PROPERTIES].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))

  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-teal-600" />
              نتائج المطابقة الذكية
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">مرتبة حسب نسبة التطابق</p>
          </div>
          <QuotaChip label="محاولات متبقية" count={freeMatches} color={freeMatches <= 1 ? 'amber' : 'teal'} />
        </div>

        {/* Quota exhausted banner */}
        {exhausted && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-800">انتهت محاولاتك المجانية</p>
              <p className="text-sm text-amber-700 mt-0.5">احصل على 10 محاولات مطابقة إضافية مقابل 29 ج.م فقط</p>
            </div>
            <button
              onClick={() => openPayment('matches')}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <CreditCard size={15} />
              احصل على محاولات إضافية
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(p => (
              <PropertyCard key={p.id} property={p} onClick={onProperty} showMatch />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
