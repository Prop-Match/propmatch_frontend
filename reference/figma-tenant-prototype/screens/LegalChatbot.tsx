import { useState, useRef, useEffect } from 'react'
import { Send, Scale, ChevronRight, Bot } from 'lucide-react'

interface Props { onBack: () => void }

interface Message {
  id: number
  role: 'user' | 'bot'
  text: string
}

const EXAMPLE_PROMPTS = [
  'ما هي مدة الإخطار قبل إنهاء العقد؟',
  'ما هي حقوق المستأجر في مصر؟',
  'كيف أسترجع التأمين بعد انتهاء العقد؟',
  'هل يمكن للمالك رفع الإيجار أثناء العقد؟',
]

const OFF_TOPIC_DECLINE = 'أنا هنا لمساعدتك في أسئلة الإيجار والقانون العقاري في مصر فقط.'

const RESPONSES: Record<string, string> = {
  'إخطار': 'وفقًا للقانون المصري، يجب على المستأجر إخطار المالك بنيّة الإخلاء قبل 30 يومًا على الأقل من تاريخ انتهاء العقد. وكذلك على المالك الإخطار قبل نفس المدة في حالة رغبته في استرداد العقار.',
  'حقوق': 'للمستأجر في مصر عدة حقوق أساسية: الحق في الانتفاع بالعقار طوال مدة العقد، الحق في صيانة المرافق الأساسية، وعدم جواز إخلائه قبل انقضاء مدة العقد إلا بحكم قضائي.',
  'تأمين': 'يحق للمستأجر استرداد التأمين كاملًا عند انتهاء العقد وتسليم الشقة بحالة جيدة. يُستقطع منه فقط قيمة أي أضرار موثّقة.',
  'رفع الإيجار': 'لا يحق للمالك رفع الإيجار خلال مدة العقد إلا إذا نصّت عقد الإيجار صراحةً على ذلك. أي اتفاق على الزيادة يجب أن يكون مكتوبًا وموقعًا من الطرفين.',
}

function getBotResponse(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, response] of Object.entries(RESPONSES)) {
    if (lower.includes(key) || text.includes(key)) return response
  }
  if (lower.includes('ايجار') || lower.includes('إيجار') || lower.includes('عقد') || lower.includes('مالك') || lower.includes('مستأجر')) {
    return 'سؤال وجيه! هذا يتعلق بقانون الإيجار المصري. للحصول على إجابة دقيقة، يُنصح بمراجعة محامٍ متخصص في العقارات. هل يمكنك توضيح سؤالك أكثر؟'
  }
  return OFF_TOPIC_DECLINE
}

export function LegalChatbot({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', text: 'أهلًا! أنا المساعد القانوني الذكي. يمكنني مساعدتك في أسئلة الإيجار والقانون العقاري المصري. كيف يمكنني مساعدتك؟' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now(), role: 'user', text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'bot', text: getBotResponse(text) }])
      setLoading(false)
    }, 800)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="text-slate-600 hover:text-teal-600">
          <ChevronRight size={20} />
        </button>
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <Scale size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">المساعد القانوني الذكي</p>
          <p className="text-xs text-slate-500">أسئلة الإيجار والقانون العقاري المصري</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-blue-600" />
              </div>
            )}
            <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tl-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tr-sm shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Bot size={14} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Example prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-400 mb-2">أسئلة شائعة:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {EXAMPLE_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => send(p)}
                className="shrink-0 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:border-teal-300 hover:text-teal-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="اكتب سؤالك القانوني..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
