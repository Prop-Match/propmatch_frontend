import { BadgeCheck, Sparkles, FileText, ShieldCheck, Search, Building2, ChevronLeft } from 'lucide-react'

interface Props { onGetStarted: () => void }

export function LandingScreen({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 7v9h4v-5h4v5h4V7L9 2z" fill="white" />
                <circle cx="12.5" cy="5.5" r="2" fill="#99f6e4" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-800 text-lg">PropMatch <span className="text-teal-600">AI</span></span>
          </div>
          <button onClick={onGetStarted} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
            إنشاء حساب
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full border border-teal-200 mb-6">
            <BadgeCheck size={14} />
            بدون عمولة سمسار
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            أجر بيتك أو اسكن<br />
            <span className="text-teal-600">مباشرة.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-2 font-medium">بدون سمسار، وبدون عمولة.</p>
          <p className="text-slate-500 mb-8 leading-relaxed">
            PropMatch AI يربطك مباشرةً بأصحاب العقارات الموثّقين في المنصورة. ذكاء اصطناعي يطابق احتياجاتك، وعقد إيجار جاهز للتوقيع.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={onGetStarted} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              ابدأ مجانًا
              <ChevronLeft size={18} />
            </button>
            <button onClick={onGetStarted} className="border border-slate-200 hover:border-teal-300 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors">
              تسجيل الدخول
            </button>
          </div>
          <div className="flex items-center gap-4 mt-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-green-600" /> هوية موثّقة</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-teal-600" /> مدفوعات آمنة</span>
            <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-blue-600" /> مطابقة ذكية</span>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&h=500&fit=crop&auto=format"
              alt="شقق للإيجار في المنصورة"
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BadgeCheck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">مالك موثّق الهوية</p>
                <p className="text-xs text-slate-500">هوية موثّقة عبر eKYC</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 mb-0.5">نسبة التطابق</p>
            <p className="font-extrabold text-2xl text-teal-600">92%</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-3">كيف يعمل PropMatch AI؟</h2>
          <p className="text-center text-slate-500 mb-10">3 خطوات بسيطة للوصول لبيتك المثالي</p>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard n="1" icon={<ShieldCheck size={24} className="text-teal-600" />} title="سجّل وأثبت هويتك" desc="أنشئ حساب واحد وأكمل التحقق من هويتك (eKYC) مرة واحدة فقط." />
            <StepCard n="2" icon={<Sparkles size={24} className="text-teal-600" />} title="دع الذكاء الاصطناعي يطابق لك" desc="حدّد ميزانيتك واحتياجاتك، والنظام يجد أفضل العقارات المتاحة." />
            <StepCard n="3" icon={<FileText size={24} className="text-teal-600" />} title="اتفق وأنشئ عقد الإيجار" desc="تواصل مع المالك مباشرة وأنشئ عقد إيجار رسمي بنقرة واحدة." />
          </div>
        </div>
      </section>

      {/* Why trust us */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-10">لماذا PropMatch AI؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TrustCard icon={<BadgeCheck size={22} className="text-green-600" />} bg="bg-green-50" title="هوية موثّقة (eKYC)" desc="كل مستخدم يمر بالتحقق من الهوية قبل الإعلان. لا مجال للنصب." />
            <TrustCard icon={<Sparkles size={22} className="text-teal-600" />} bg="bg-teal-50" title="مطابقة ذكية بالذكاء الاصطناعي" desc="النظام يحلل احتياجاتك ويعرض عليك العقارات الأنسب مع نسبة تطابق واضحة." />
            <TrustCard icon={<FileText size={22} className="text-teal-600" />} bg="bg-blue-50" title="عقد إيجار جاهز" desc="أنشئ عقد إيجار رسمي متوافق مع القانون المصري وحمّله مجانًا." />
          </div>
        </div>
      </section>

      {/* For tenants vs landlords */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
              <Search size={24} className="text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">للمستأجرين</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              {['ابحث في مئات العقارات الموثّقة','مطابقة ذكية بالذكاء الاصطناعي','تواصل مباشر مع المالك','عقد إيجار رسمي مجاني'].map(t => (
                <li key={t} className="flex items-center gap-2"><BadgeCheck size={14} className="text-green-500 shrink-0" />{t}</li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
              ابحث عن عقار
            </button>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">لأصحاب العقارات</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              {['أول إعلان ليك مجانًا!','يصلك المستأجر المناسب بالذكاء الاصطناعي','بدون سماسرة أو عمولات','إدارة كاملة للعقارات والاستفسارات'].map(t => (
                <li key={t} className="flex items-center gap-2"><BadgeCheck size={14} className="text-green-500 shrink-0" />{t}</li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
              أضف عقارك
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p className="font-bold text-slate-600 mb-1">PropMatch AI</p>
        <p>المنصورة، مصر · جميع الحقوق محفوظة 2024</p>
      </footer>
    </div>
  )
}

function StepCard({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
      <div className="absolute top-4 left-4 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{n}</div>
      <div className="mb-4 mt-2">{icon}</div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function TrustCard({ icon, bg, title, desc }: { icon: React.ReactNode; bg: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl p-6 border border-slate-100 bg-white shadow-sm">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
