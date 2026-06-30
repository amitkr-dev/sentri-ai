import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Calendar, TrendingDown, Link2, Moon, FileWarning } from 'lucide-react'

const SIGNAL_LIBRARY = [
  { key: 'time',      icon: Clock,        label: 'Time available vs. needed',     base: 85 },
  { key: 'calendar',  icon: Calendar,     label: 'Calendar density this week',     base: 78 },
  { key: 'velocity',  icon: TrendingDown, label: 'Past task velocity for this tag', base: 65 },
  { key: 'deps',      icon: Link2,        label: 'Unresolved dependencies',        base: 60 },
  { key: 'focus',     icon: Moon,         label: 'Scheduled focus time',           base: 72 },
  { key: 'scope',     icon: FileWarning,  label: 'Scope vs. original estimate',    base: 55 },
]

export default function SignalBreakdown({ task }) {
  if (!task) return null

  // Deterministic pseudo-variance per task so each task's bars look distinct, not identical
  const seed = task.id.charCodeAt(task.id.length - 1)
  const signals = SIGNAL_LIBRARY.map((s, i) => ({
    ...s,
    value: Math.min(96, Math.max(15, s.base + ((seed + i * 7) % 23) - 11)),
  })).sort((a, b) => b.value - a.value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(239,68,68,0.18)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white">Why This Is Risky</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          {task.risk}% risk
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-4 truncate">{task.title} — explained signal by signal</p>

      <div className="space-y-3">
        {signals.map((s, i) => {
          const Icon = s.icon
          const color = s.value >= 75 ? '#ef4444' : s.value >= 50 ? '#f59e0b' : '#22c55e'
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={12} style={{ color }} className="flex-shrink-0" />
                <span className="text-xs font-medium text-zinc-300 flex-1">{s.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color }}>{s.value}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">{task.reason}</p>
      </div>
    </motion.div>
  )
}
