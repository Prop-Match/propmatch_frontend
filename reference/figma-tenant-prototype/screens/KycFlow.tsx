import { useState } from 'react'
import { Camera, ScanLine, ScanFace, CheckCircle2, AlertCircle, Upload, ChevronRight, Shield } from 'lucide-react'
import type { Screen } from '../types'
import { OwnershipDisclaimer } from '../components/shared/OwnershipDisclaimer'

type KycStep = 'kyc-id-front' | 'kyc-id-back' | 'kyc-selfie' | 'kyc-processing' | 'kyc-success' | 'kyc-failure' | 'kyc-disclaimer'

interface Props {
  step: KycStep
  onNext: (s: Screen) => void
  onVerified: () => void
}

const STEPS = [
  { id: 'kyc-id-front', label: 'وجه البطاقة الأمامي', n: 1 },
  { id: 'kyc-id-back', label: 'وجه البطاقة الخلفي', n: 2 },
  { id: 'kyc-selfie', label: 'صورة شخصية للتحقق', n: 3 },
]

export function KycFlow({ step, onNext, onVerified }: Props) {
  const [uploaded, setUploaded] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(2)

  const handleUpload = () => setUploaded(true)

  const stepIndex = STEPS.findIndex(s => s.id === step)

  if (step === 'kyc-processing') return <ProcessingState onNext={() => onNext('kyc-success')} />
  if (step === 'kyc-success') return <SuccessState onNext={() => { onVerified(); onNext('kyc-disclaimer') }} />
  if (step === 'kyc-failure') return <FailureState attemptsLeft={attemptsLeft} onRetry={() => { setAttemptsLeft(a => a - 1); setUploaded(false); onNext('kyc-id-front') }} onContact={() => onNext('dashboard')} />
  if (step === 'kyc-disclaimer') return <DisclaimerState onNext={() => onNext('dashboard')} />

  const isBack = step === 'kyc-id-back'
  const isSelfie = step === 'kyc-selfie'

  const nextStep: Screen = step === 'kyc-id-front' ? 'kyc-id-back' : step === 'kyc-id-back' ? 'kyc-selfie' : 'kyc-processing'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full border border-teal-200 mb-3">
            <Shield size={13} />
            التحقق من الهوية (eKYC)
          </div>
          <h1 className="text-xl font-bold text-slate-800">توثيق الهوية الشخصية</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.n}</div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < stepIndex ? 'bg-teal-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              {isSelfie ? <ScanFace size={20} className="text-teal-600" /> : <ScanLine size={20} className="text-teal-600" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                {isSelfie ? 'صورة شخصية للتحقق (تحقق حي)' : isBack ? 'وجه البطاقة الخلفي' : 'وجه البطاقة الأمامي'}
              </h2>
              <p className="text-xs text-slate-500">
                {isSelfie ? 'ضع وجهك داخل الإطار بوضوح' : 'تأكد من وضوح البيانات والصورة'}
              </p>
            </div>
          </div>

          {/* Upload frame */}
          {!uploaded ? (
            <div
              onClick={handleUpload}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
            >
              {isSelfie ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 border-4 border-teal-300 rounded-full flex items-center justify-center bg-slate-50">
                    <ScanFace size={40} className="text-teal-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">انقر لفتح الكاميرا</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-40 h-24 border-2 border-teal-300 rounded-xl flex items-center justify-center bg-slate-50">
                    <ScanLine size={32} className="text-teal-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">انقر لرفع صورة البطاقة</p>
                  <p className="text-xs text-slate-400">أو التقاط صورة بالكاميرا</p>
                </div>
              )}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button className="flex items-center gap-1.5 text-teal-600 text-sm font-medium"><Camera size={15} />كاميرا</button>
                <button className="flex items-center gap-1.5 text-teal-600 text-sm font-medium"><Upload size={15} />رفع ملف</button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-teal-400 rounded-2xl p-6 text-center bg-teal-50">
              <CheckCircle2 size={32} className="text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-teal-700">تم رفع الصورة بنجاح</p>
              <button onClick={() => setUploaded(false)} className="text-xs text-slate-500 mt-1 underline">تغيير الصورة</button>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 text-center">تأكد من وضوح الصورة وعدم وجود وهج أو ظلال</p>
          </div>

          <button
            onClick={() => onNext(nextStep)}
            disabled={!uploaded}
            className="mt-5 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {step === 'kyc-selfie' ? 'إرسال للمراجعة' : 'التالي'}
          </button>
        </div>

        <button onClick={() => onNext('dashboard')} className="mt-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto">
          <ChevronRight size={16} />
          تخطي الآن وإكماله لاحقًا
        </button>
      </div>
    </div>
  )
}

function ProcessingState({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Shield size={36} className="text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">جاري التحقق من هويتك</h2>
        <p className="text-slate-500 text-sm mb-6">يرجى الانتظار، قد يستغرق هذا بضع ثوانٍ...</p>
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full animate-[load_2s_ease-in-out_infinite]" style={{ width: '70%' }} />
        </div>
        <button onClick={onNext} className="mt-8 text-sm text-teal-600 underline">محاكاة اكتمال التحقق</button>
      </div>
    </div>
  )
}

function SuccessState({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 font-bold text-sm px-4 py-2 rounded-full border border-green-200 mb-4">
            هوية موثّقة
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">تم التحقق من هويتك</h2>
          <div className="bg-slate-50 rounded-xl p-4 text-right mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-800 font-semibold">محمد أحمد إبراهيم</span>
              <span className="text-slate-500">الاسم</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-800 font-mono">••••••••1234</span>
              <span className="text-slate-500">الرقم القومي</span>
            </div>
          </div>
          <button onClick={onNext} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
            متابعة
          </button>
        </div>
      </div>
    </div>
  )
}

function FailureState({ attemptsLeft, onRetry, onContact }: { attemptsLeft: number; onRetry: () => void; onContact: () => void }) {
  const locked = attemptsLeft <= 0
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {locked ? 'تم إيقاف التحقق مؤقتًا' : 'لم نتمكن من التحقق من هويتك'}
          </h2>
          {locked ? (
            <p className="text-slate-500 text-sm mb-6">لقد استنفدت جميع محاولاتك. يرجى التواصل مع الدعم.</p>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-3">جودة الصورة غير كافية. تأكد من الإضاءة الجيدة ووضوح البيانات.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                <p className="text-sm text-amber-800">
                  المحاولات المتبقية: <strong>{attemptsLeft}</strong> من 3
                </p>
              </div>
            </>
          )}
          {locked ? (
            <button onClick={onContact} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
              التواصل مع الدعم
            </button>
          ) : (
            <button onClick={onRetry} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
              المحاولة مرة أخرى
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DisclaimerState({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Shield size={24} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 text-center mb-4">تنبيه مهم بشأن الملكية</h2>
          <OwnershipDisclaimer />
          <p className="text-sm text-slate-500 mt-4 leading-relaxed">
            يتحقق PropMatch AI من هوية المستخدمين عبر نظام eKYC، غير أنه لا يتحقق من وثائق ملكية العقارات. جميع الإعلانات مسؤولية أصحابها.
          </p>
          <button onClick={onNext} className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
            فهمت، المتابعة
          </button>
        </div>
      </div>
    </div>
  )
}
