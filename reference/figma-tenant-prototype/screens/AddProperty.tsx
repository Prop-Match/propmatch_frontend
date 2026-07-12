import { useState } from 'react'
import { Sparkles, Upload, ChevronRight, CheckCircle2 } from 'lucide-react'

interface Props {
  onSubmit: () => void
  onBack: () => void
}

const AMENITIES_OPTIONS = ['انترنت فايبر', 'تكييف مركزي', 'مصعد', 'جراج', 'حارس أمن', 'مولد كهرباء', 'سخان شمسي', 'حديقة', 'سطح', 'مطبخ مجهز']

const RAW_DESC = 'شقة 3 غرف في المنصورة. طابق ثالث بمصعد. قريبة من المواصلات. نظيفة.'
const AI_DESC = 'شقة سكنية أنيقة من 3 غرف نوم واسعة، تقع في الطابق الثالث بمصعد في قلب المنصورة. تتميز بموقع استراتيجي قريب من وسائل المواصلات الرئيسية، مما يجعل التنقل اليومي في غاية السهولة. تمتاز بالنظافة والصيانة الجيدة، وستكون بيتك المثالي!'

export function AddProperty({ onSubmit, onBack }: Props) {
  const [form, setForm] = useState({
    address: '', neighborhood: '', type: 'شقة', bedrooms: '3', bathrooms: '2',
    area: '120', floor: '3', furnished: false, rent: '', description: RAW_DESC,
  })
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [optimizerUsed, setOptimizerUsed] = useState(0)
  const [showOptimizer, setShowOptimizer] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const FREE_OPTIMIZER = 2
  const remainingOptimizer = FREE_OPTIMIZER - optimizerUsed

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(s => s.includes(a) ? s.filter(x => x !== a) : [...s, a])

  const runOptimizer = () => {
    setShowOptimizer(true)
    setOptimizerUsed(v => v + 1)
  }

  const applyAI = () => {
    setForm(f => ({ ...f, description: AI_DESC }))
    setAiApplied(true)
    setShowOptimizer(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-600 hover:text-teal-600">
            <ChevronRight size={18} />
            رجوع
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="font-bold text-slate-800">إضافة عقار جديد</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-5">
          <p className="text-sm text-teal-700 font-semibold">أول إعلان ليك مجانًا!</p>
          <p className="text-xs text-teal-600 mt-0.5">الإعلانات التالية برسوم رمزية 99 ج.م فقط</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {/* Location */}
          <Section title="الموقع">
            <Field label="العنوان التفصيلي" value={form.address} onChange={set('address')} placeholder="مثال: شقة 5، عمارة 12، شارع الجامعة" />
            <Field label="الحي" value={form.neighborhood} onChange={set('neighborhood')} placeholder="مثال: المنصورة الجديدة" />
          </Section>

          <div className="h-px bg-slate-100" />

          {/* Details */}
          <Section title="تفاصيل العقار">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="نوع العقار" value={form.type} onChange={set('type')} options={['شقة', 'دور كامل', 'استوديو', 'غرفة']} />
              <Field label="الطابق" value={form.floor} onChange={set('floor')} type="number" />
              <Field label="غرف النوم" value={form.bedrooms} onChange={set('bedrooms')} type="number" />
              <Field label="الحمّامات" value={form.bathrooms} onChange={set('bathrooms')} type="number" />
              <Field label="المساحة (م²)" value={form.area} onChange={set('area')} type="number" />
              <Field label="الإيجار الشهري (ج.م)" value={form.rent} onChange={set('rent')} type="number" placeholder="مثال: 4500" />
            </div>

            {/* Furnished toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">مفروش</span>
              <button
                onClick={() => setForm(f => ({ ...f, furnished: !f.furnished }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.furnished ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.furnished ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </Section>

          <div className="h-px bg-slate-100" />

          {/* Amenities */}
          <Section title="المميزات">
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${selectedAmenities.includes(a) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
                >
                  {selectedAmenities.includes(a) && <CheckCircle2 size={12} />}
                  {a}
                </button>
              ))}
            </div>
          </Section>

          <div className="h-px bg-slate-100" />

          {/* Photos */}
          <Section title="الصور">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-400 hover:bg-teal-50/20 transition-all cursor-pointer">
              <Upload size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">اسحب الصور هنا أو انقر للتحميل</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG حتى 10MB · حد أقصى 10 صور</p>
            </div>
          </Section>

          <div className="h-px bg-slate-100" />

          {/* Description + AI Optimizer */}
          <Section title="الوصف">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">الوصف</label>
                <div className="flex items-center gap-2">
                  {remainingOptimizer > 0 ? (
                    <span className="text-xs text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
                      {remainingOptimizer} استخدامات مجانية متبقية
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      انتهت الاستخدامات المجانية
                    </span>
                  )}
                  <button
                    onClick={runOptimizer}
                    disabled={remainingOptimizer <= 0}
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Sparkles size={12} />
                    تحسين الوصف بالذكاء الاصطناعي
                  </button>
                </div>
              </div>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none"
              />
              {aiApplied && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={11} />تم تطبيق التحسين بالذكاء الاصطناعي</p>
              )}
            </div>
          </Section>

          {/* AI Optimizer before/after modal */}
          {showOptimizer && (
            <div className="border border-teal-200 bg-teal-50 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-teal-800 flex items-center gap-2"><Sparkles size={14} />تحسين الوصف بالذكاء الاصطناعي</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">قبل</p>
                  <div className="bg-white rounded-xl p-3 text-xs text-slate-600 border border-slate-100">{RAW_DESC}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-teal-700 mb-1">بعد (مُحسَّن)</p>
                  <div className="bg-white rounded-xl p-3 text-xs text-teal-800 border border-teal-200">{AI_DESC}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={applyAI} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors">
                  تطبيق التحسين
                </button>
                <button onClick={() => setShowOptimizer(false)} className="px-4 text-sm text-slate-500 hover:text-slate-700">
                  تجاهل
                </button>
              </div>
            </div>
          )}

          <button onClick={onSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors text-base">
            نشر الإعلان
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
        dir={type === 'number' ? 'ltr' : 'rtl'}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 bg-white"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
