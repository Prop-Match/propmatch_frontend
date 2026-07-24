import { Button } from "@/src/components/ui/Button";
import { Logo } from "@/src/components/ui/Logo";
import { landingAfterLogin } from "@/src/features/auth/roleRouting";
import { getServerSession } from "@/src/lib/api/serverSession";
import { ArrowLeft, BadgeCheck, FileText, Home, Search, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const steps = [
  { n: "١", title: "أنشئ حسابك", text: "سجّل كمستأجر أو مالك أو الاثنين في دقيقة." },
  { n: "٢", title: "وثّق هويتك", text: "تحقق سريع من الهوية يمنح الثقة للطرفين." },
  { n: "٣", title: "تطابق واستأجر", text: "المطابقة الذكية تجد سكنك، والعقد جاهز للتحميل." },
];

const trust = [
  { Icon: ShieldCheck, title: "ملاك موثّقو الهوية", text: "نتحقق من هوية كل مالك قبل نشر إعلانه." },
  { Icon: Sparkles, title: "مطابقة ذكية", text: "صف سكنك المثالي بكلماتك، والذكاء الاصطناعي يجده." },
  { Icon: FileText, title: "عقد جاهز", text: "أنشئ عقد إيجار مصري قياسي وحمّله PDF مجانًا." },
];

export default async function LandingPage() {
  const user = await getServerSession();
  if (user) {
    redirect(landingAfterLogin(user.role));
  }
  return (
    <div className="flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-small font-semibold">
              <BadgeCheck className="size-4" aria-hidden />
              بدون عمولة سمسار
            </span>
            <h1 className="text-display font-bold leading-tight md:text-5xl">
              استأجر مباشرة من المالك.
            </h1>
            <p className="text-h2 font-semibold text-white/90">
              سوق إيجار سكني طويل الأمد في المنصورة — ملاك موثّقون، مطابقة ذكية، وعقد جاهز.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  ابدأ الآن
                  <ArrowLeft className="size-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/tenant">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  تصفّح العقارات
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-card bg-white/10 p-6 backdrop-blur">
              {trust.map(({ Icon, title }) => (
                <div key={title} className="flex items-center gap-3 rounded-control bg-white/10 p-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-semibold">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="mb-8 text-center text-h1 font-bold text-ink">كيف يعمل؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col gap-2 rounded-card border border-hairline bg-surface p-6 shadow-card">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-tint text-title font-bold text-primary">
                {s.n}
              </span>
              <h3 className="text-title font-bold text-ink">{s.title}</h3>
              <p className="text-small text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why trust us */}
      <section className="bg-surface py-14">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="mb-8 text-center text-h1 font-bold text-ink">لماذا PropMatch AI؟</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {trust.map(({ Icon, title, text }) => (
              <div key={title} className="flex flex-col items-start gap-3 rounded-card border border-hairline p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-success-tint text-success">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-title font-bold text-ink">{title}</h3>
                <p className="text-small text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tenant vs owner */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-card bg-primary-tint p-8">
            <Search className="size-8 text-primary" aria-hidden />
            <h3 className="text-h2 font-bold text-ink">للمستأجرين</h3>
            <p className="text-body text-body-text">صف سكنك المثالي ودع المطابقة الذكية تبحث نيابةً عنك بين إعلانات موثّقة.</p>
            <Link href="/signup" className="mt-2">
              <Button>أبحث عن سكن</Button>
            </Link>
          </div>
          <div className="flex flex-col gap-3 rounded-card bg-trust-blue-tint p-8">
            <Home className="size-8 text-trust-blue" aria-hidden />
            <h3 className="text-h2 font-bold text-ink">للملّاك</h3>
            <p className="text-body text-body-text">اعرض عقارك مباشرة للمستأجرين المهتمين — أول إعلان مجانًا، وبدون وسطاء.</p>
            <Link href="/signup" className="mt-2">
              <Button variant="secondary">أعرض عقاري</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline bg-surface py-8 text-center text-small text-muted">
        PropMatch AI — المنصورة، مصر · «استأجر مباشرة من المالك. بدون سمسار، وبدون عمولة.»
      </footer>
    </div>
  );
}
