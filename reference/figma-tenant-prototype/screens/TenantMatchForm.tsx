import { useState } from 'react'
import { Sparkles, ChevronLeft } from 'lucide-react'
import type { Screen, UserRole } from '../types'
import { NavBar } from '../components/shared/NavBar'
import { QuotaChip } from '../components/shared/Badge'

interface Props {
  freeMatches: number
  onSearch: () => void
  onNav: (s: Screen) => void
  role: UserRole
  onSwitchRole: (r: UserRole) => void
}

export function TenantMatchForm({ freeMatches, onSearch, onNav, role, onSwitchRole }: Props) {
  const [budget, setBudget] = useState([2000, 6000])
  const [neighborhood, setNeighborhood] = useState('')
  const [propertyType, setPropertyType] = useState('شقة')
  const [bedrooms, setBedrooms] = useState('2')
  const [furnished, setFurnished] = useState(false)
  const [lifestyle, setLifestyle] = useState('')
  const [commute, setCommute] = useState('')

  return (
    <div>
      <NavBar role={role} onNav={onNav} onSwitchRole={onSwitchRole} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles size={22} className="text-teal-600" />
              المطابقة الذكية
            </h1>
            <p className="text-slate-500 text-sm mt-1">أخبرنا عن احتياجاتك ونجد لك الأنسب</p>
          </div>
          <QuotaChip label="محاولات مجانية متبقية" count={freeMatches} color={freeMatches <= 1 ? 'amber' : 'teal'} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {/* Budget slider */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-3">
              الميزانية
              <span className="text-teal-600 font-bold mr-2">{budget[0].toLocaleString()} – {budget[1].toLocaleString()} ج.م / شهريًا</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>500 ج.م</span>
                <span>15,000 ج.م</span>
              </div>
              <input
                type="range"
                min={500} max={15000} step={500}
                value={budget[1]}
                onChange={e => setBudget([budget[0], Number(e.target.value)])}
                className="w-full accent-teal-600"
              />
            </div>
          </div>

          {/* Neighborhood */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">الحي المفضّل</label>
            <input
              type="text"
              placeholder="مثال: المنصورة الجديدة، قرب الجامعة..."
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
            />
          </div>

          {/* Property type */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">نوع العقار</label>
            <div className="flex gap-2 flex-wrap">
              {['شقة', 'دور كامل', 'استوديو', 'غرفة'].map(t => (
                <button
                  key={t}
                  onClick={() => setPropertyType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${propertyType === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">عدد غرف النوم</label>
            <div className="flex gap-2">
              {['1', '2', '3', '4+'].map(n => (
                <button
                  key={n}
                  onClick={() => setBedrooms(n)}
                  className={`w-12 h-10 rounded-xl text-sm font-bold border transition-all ${bedrooms === n ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Furnished */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">التأثيث</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFurnished(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${furnished ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                مفروش
              </button>
              <button
                onClick={() => setFurnished(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!furnished ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                غير مفروش
              </button>
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">نمط الحياة والتفضيلات</label>
            <textarea
              placeholder="مثال: منطقة هادئة قرب الجامعة، أفضّل طابق عالي..."
              value={lifestyle}
              onChange={e => setLifestyle(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none"
            />
          </div>

          {/* Commute */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">ملاحظة التنقل (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: أعمل في مستشفى المنصورة الجامعي"
              value={commute}
              onChange={e => setCommute(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
            />
          </div>

          <button
            onClick={onSearch}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Sparkles size={18} />
            ابحث عن سكنك
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
