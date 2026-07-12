import { useState } from 'react'
import { X, CreditCard, CheckCircle2, AlertCircle, Lock } from 'lucide-react'

interface PaymentModalProps {
  context: 'listing' | 'boost' | 'matches'
  onSuccess: () => void
  onClose: () => void
}

const CONTEXT_INFO = {
  listing: { title: 'رسوم إضافة إعلان', amount: 99, description: 'إضافة إعلان عقار جديد' },
  boost: { title: 'تمييز الإعلان', amount: 49, description: 'تمييز إعلانك لمدة 30 يوم' },
  matches: { title: 'محاولات مطابقة إضافية', amount: 29, description: '10 محاولات مطابقة ذكية' },
}

export function PaymentModal({ context, onSuccess, onClose }: PaymentModalProps) {
  const [state, setState] = useState<'form' | 'success' | 'failure'>('form')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const info = CONTEXT_INFO[context]

  const handlePay = () => {
    if (card.number.length < 16) { setState('failure'); return }
    setState('success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Paymob header */}
        <div className="bg-[#00AAFF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-1">
              <span className="font-black text-[#00AAFF] text-sm tracking-tight">Paymob</span>
            </div>
            <span className="text-white/80 text-sm">الدفع الآمن</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {state === 'form' && (
            <>
              <div className="mb-5 p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{info.title}</p>
                  <p className="text-sm text-slate-500">{info.description}</p>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-teal-600">{info.amount}</span>
                  <span className="text-sm text-slate-500"> ج.م</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">اسم صاحب البطاقة</label>
                  <input
                    type="text"
                    placeholder="الاسم كما هو على البطاقة"
                    value={card.name}
                    onChange={e => setCard(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">رقم البطاقة</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={16}
                      value={card.number}
                      onChange={e => setCard(p => ({ ...p, number: e.target.value.replace(/\D/g, '') }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 pl-10"
                      dir="ltr"
                    />
                    <CreditCard size={16} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={card.expiry}
                      onChange={e => setCard(p => ({ ...p, expiry: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="000"
                      maxLength={3}
                      value={card.cvv}
                      onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                className="mt-5 w-full bg-[#00AAFF] hover:bg-[#0099ee] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                ادفع بأمان عبر Paymob — {info.amount} ج.م
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={10} />
                مدفوعات آمنة ومشفّرة بالكامل
              </p>
            </>
          )}

          {state === 'success' && (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">تم الدفع بنجاح</h3>
                <p className="text-slate-500 text-sm">تم خصم {info.amount} ج.م من بطاقتك</p>
              </div>
              <button
                onClick={onSuccess}
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors"
              >
                متابعة
              </button>
            </div>
          )}

          {state === 'failure' && (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">فشلت عملية الدفع</h3>
                <p className="text-slate-500 text-sm">يرجى المحاولة مرة أخرى أو استخدام بطاقة أخرى</p>
              </div>
              <button
                onClick={() => setState('form')}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors"
              >
                المحاولة مرة أخرى
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
