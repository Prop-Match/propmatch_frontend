import { useState } from 'react'
import { BedDouble, Bath, Ruler, Sofa, CheckCircle2, Lock, Phone, Scale, FileText, ChevronRight } from 'lucide-react'
import type { Screen } from '../types'
import { VerifiedBadge, MatchScore, BoostedTag } from '../components/shared/Badge'
import { OwnershipDisclaimer } from '../components/shared/OwnershipDisclaimer'
import { SAMPLE_PROPERTIES } from '../components/shared/PropertyCard'

interface Props {
  onChatbot: () => void
  onContract: () => void
  onBack: () => void
  onNav: (s: Screen) => void
}

const AMENITIES = ['انترنت فايبر', 'تكييف مركزي', 'مصعد', 'جراج', 'حارس أمن', 'مولد كهرباء', 'سخان شمسي']

const GALLERY = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
]

export function PropertyDetail({ onChatbot, onContract, onBack }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const [contactUnlocked] = useState(false)
  const prop = SAMPLE_PROPERTIES[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600">
            <ChevronRight size={18} />
            رجوع
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-medium text-slate-700 truncate">{prop.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-slate-200">
              <img src={GALLERY[activeImg]} alt={prop.title} className="w-full h-64 md:h-80 object-cover" />
              <div className="flex gap-2 p-3">
                {GALLERY.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`flex-1 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-teal-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {prop.verified && <VerifiedBadge />}
                {prop.boosted && <BoostedTag />}
                {prop.matchScore && <MatchScore score={prop.matchScore} size={52} />}
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 mt-2">{prop.title}</h1>
              <p className="text-slate-500 mt-1">{prop.neighborhood}، المنصورة</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <StatBox icon={<BedDouble size={18} className="text-teal-600" />} label="غرف النوم" value={String(prop.bedrooms)} />
              <StatBox icon={<Bath size={18} className="text-teal-600" />} label="الحمّامات" value={String(prop.bathrooms)} />
              <StatBox icon={<Ruler size={18} className="text-teal-600" />} label="المساحة" value={`${prop.area} م²`} />
              <StatBox icon={<Sofa size={18} className="text-teal-600" />} label="التأثيث" value={prop.furnished ? 'مفروش' : 'غير مفروش'} />
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3">المميزات</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <span key={a} className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-sm px-3 py-1.5 rounded-full border border-teal-100">
                    <CheckCircle2 size={13} />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-slate-800 mb-2">الوصف</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                شقة مفروشة بالكامل في موقع مميز بالمنصورة الجديدة. تتميز بالهدوء والإضاءة الطبيعية الجيدة. قريبة من جميع الخدمات ووسائل المواصلات. مناسبة للعائلات والأزواج.
              </p>
            </div>

            {/* Ownership disclaimer */}
            <OwnershipDisclaimer />

            {/* Legal chatbot */}
            <button
              onClick={onChatbot}
              className="w-full flex items-center gap-3 border border-slate-200 rounded-2xl p-4 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-right"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Scale size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">المساعد القانوني الذكي</p>
                <p className="text-xs text-slate-500">لديك سؤال قانوني؟ اسأل مساعدنا الذكي</p>
              </div>
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-20">
              <div className="text-center mb-4">
                <span className="text-3xl font-extrabold text-teal-600">{prop.price.toLocaleString()}</span>
                <span className="text-slate-500 text-sm"> ج.م / شهريًا</span>
              </div>

              {/* Contact owner */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 text-center">
                {contactUnlocked ? (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">رقم المالك</p>
                    <a href="tel:01012345678" className="text-lg font-bold text-teal-600 flex items-center justify-center gap-2">
                      <Phone size={18} />
                      01012345678
                    </a>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-1.5">
                      <Lock size={14} />
                      <span className="text-sm font-medium">رقم الهاتف مخفي لحماية الخصوصية</span>
                    </div>
                    <p className="text-xs text-slate-400">رقم المالك متاح بعد تأكيد التطابق</p>
                  </div>
                )}
              </div>

              <button
                onClick={onContract}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                إنشاء عقد إيجار
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-slate-800 text-sm">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
