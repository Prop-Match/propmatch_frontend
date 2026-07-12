import { ShieldCheck } from 'lucide-react'

export function OwnershipDisclaimer() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-600" />
      <p>يتم التحقق من هوية المستخدم فقط، أما ملكية العقار فيُقرّ بها المُعلن على مسؤوليته.</p>
    </div>
  )
}
