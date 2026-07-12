import { useState } from 'react'
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react'
import type { Screen, UserRole } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { PropertyCard, SAMPLE_PROPERTIES } from '../components/shared/PropertyCard'

interface Props {
  onProperty: () => void
  onMatch: () => void
  onNav: (s: Screen) => void
  role: UserRole
  onSwitchRole: (r: UserRole) => void
}

const NEIGHBORHOODS = ['الكل', 'وسط البلد', 'المنصورة الجديدة', 'الجامعة', 'حي الجامعيين', 'محطة القطار']

export function TenantBrowse({ onProperty, onMatch, onNav, role, onSwitchRole }: Props) {
  const [query, setQuery] = useState('')
  const [activeNeighborhood, setActiveNeighborhood] = useState('الكل')

  const filtered = SAMPLE_PROPERTIES.filter(p => {
    const matchQuery = !query || p.title.includes(query) || p.neighborhood.includes(query)
    const matchNeighborhood = activeNeighborhood === 'الكل' || p.neighborhood === activeNeighborhood
    return matchQuery && matchNeighborhood
  })

  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Smart Match CTA banner */}
        <div className="bg-gradient-to-l from-teal-600 to-teal-500 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg mb-0.5">المطابقة الذكية</p>
            <p className="text-teal-100 text-sm">دع الذكاء الاصطناعي يجد بيتك المثالي بناءً على احتياجاتك</p>
          </div>
          <button
            onClick={onMatch}
            className="shrink-0 bg-white hover:bg-teal-50 text-teal-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            ابحث عن سكنك
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث بالحي أو اسم العقار..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 bg-white shadow-sm"
          />
        </div>

        {/* Neighborhood filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          {NEIGHBORHOODS.map(n => (
            <button
              key={n}
              onClick={() => setActiveNeighborhood(n)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${activeNeighborhood === n ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">{filtered.length} عقار متاح</p>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-teal-300">
            <SlidersHorizontal size={14} />
            فلتر
          </button>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} onClick={onProperty} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">لا توجد نتائج</p>
            <p className="text-slate-400 text-sm mt-1">جرّب تغيير كلمات البحث أو الحي</p>
          </div>
        )}
      </div>
    </div>
  )
}
