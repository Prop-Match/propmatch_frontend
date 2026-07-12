import { BedDouble, Bath, Ruler, BadgeCheck, Sofa } from 'lucide-react'
import { MatchScore, BoostedTag, VerifiedBadge } from './Badge'

export interface Property {
  id: number
  title: string
  neighborhood: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  furnished: boolean
  verified: boolean
  boosted: boolean
  matchScore?: number
  image: string
}

interface PropertyCardProps {
  property: Property
  onClick: () => void
  showMatch?: boolean
}

export function PropertyCard({ property, onClick, showMatch }: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
    >
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {property.boosted && <BoostedTag />}
          {property.verified && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-white/90 text-green-700 rounded-full font-medium border border-green-200">
              <BadgeCheck size={11} />
              موثّق
            </span>
          )}
        </div>
        {showMatch && property.matchScore && (
          <div className="absolute bottom-2 left-2 bg-white rounded-xl p-1.5 shadow-sm">
            <MatchScore score={property.matchScore} size={44} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight">{property.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{property.neighborhood}</p>
          </div>
          <div className="text-left shrink-0">
            <span className="text-lg font-bold text-teal-600">{property.price.toLocaleString()}</span>
            <span className="text-xs text-slate-400 block">ج.م / شهريًا</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50">
          <span className="flex items-center gap-1"><BedDouble size={12} />{property.bedrooms} غرف</span>
          <span className="flex items-center gap-1"><Bath size={12} />{property.bathrooms} حمّام</span>
          <span className="flex items-center gap-1"><Ruler size={12} />{property.area} م²</span>
          {property.furnished && <span className="flex items-center gap-1"><Sofa size={12} />مفروش</span>}
        </div>
      </div>
    </div>
  )
}

export const SAMPLE_PROPERTIES: Property[] = [
  { id: 1, title: 'شقة مفروشة في المنصورة الجديدة', neighborhood: 'المنصورة الجديدة', price: 4500, bedrooms: 2, bathrooms: 1, area: 90, furnished: true, verified: true, boosted: true, matchScore: 92, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=350&fit=crop&auto=format' },
  { id: 2, title: 'شقة واسعة قرب جامعة المنصورة', neighborhood: 'الجامعة', price: 3200, bedrooms: 3, bathrooms: 2, area: 130, furnished: false, verified: true, boosted: false, matchScore: 85, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=350&fit=crop&auto=format' },
  { id: 3, title: 'دور أرضي هادئ - شارع جانبي', neighborhood: 'حي الجامعيين', price: 2800, bedrooms: 2, bathrooms: 1, area: 110, furnished: false, verified: false, boosted: false, matchScore: 74, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=350&fit=crop&auto=format' },
  { id: 4, title: 'شقة مفروشة بالكامل - موقع مميز', neighborhood: 'وسط البلد', price: 5500, bedrooms: 3, bathrooms: 2, area: 140, furnished: true, verified: true, boosted: true, matchScore: 88, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=350&fit=crop&auto=format' },
  { id: 5, title: 'غرفتان وريسبشن - إيجار هادئ', neighborhood: 'محطة القطار', price: 2500, bedrooms: 2, bathrooms: 1, area: 80, furnished: false, verified: true, boosted: false, matchScore: 67, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=350&fit=crop&auto=format' },
  { id: 6, title: 'شقة دور ثالث بمصعد', neighborhood: 'الدقي', price: 3800, bedrooms: 3, bathrooms: 1, area: 115, furnished: false, verified: true, boosted: false, matchScore: 79, image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1724?w=600&h=350&fit=crop&auto=format' },
]
