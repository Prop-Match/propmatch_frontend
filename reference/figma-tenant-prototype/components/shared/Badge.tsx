import { BadgeCheck, Clock, AlertCircle } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md'
}

export function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const cls = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5'
  return (
    <span className={`inline-flex items-center ${cls} bg-green-50 text-green-700 border border-green-200 rounded-full font-medium`}>
      <BadgeCheck size={size === 'sm' ? 12 : 14} />
      مستخدم موثّق الهوية
    </span>
  )
}

interface StatusChipProps {
  status: 'approved' | 'pending' | 'rejected'
}

export function StatusChip({ status }: StatusChipProps) {
  const map = {
    approved: { label: 'تمت الموافقة', cls: 'bg-green-50 text-green-700 border-green-200', icon: <BadgeCheck size={12} /> },
    pending: { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
    rejected: { label: 'مرفوض', cls: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={12} /> },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 border rounded-full font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  )
}

interface MatchScoreProps {
  score: number
  size?: number
}

export function MatchScore({ score, size = 48 }: MatchScoreProps) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
          {score}%
        </text>
      </svg>
      <span className="text-xs text-slate-500">تطابق</span>
    </div>
  )
}

export function BoostedTag() {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-teal-600 text-white rounded-full font-medium">
      إعلان مميّز
    </span>
  )
}

export function QuotaChip({ label, count, color = 'teal' }: { label: string; count: number; color?: string }) {
  const cls = color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-200'
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 border rounded-full font-medium ${cls}`}>
      {count} {label}
    </span>
  )
}
