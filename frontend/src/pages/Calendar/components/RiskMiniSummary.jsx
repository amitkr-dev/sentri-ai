import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

const MINI_TASKS = [
  { name: 'Hackathon Submission', risk: 91, level: 'high' },
  { name: 'Q3 Report Draft', risk: 58, level: 'med' },
  { name: 'API Integration', risk: 12, level: 'low' },
]

const LEVEL_COLOR = {
  high: 'bg-danger',
  med: 'bg-warning',
  low: 'bg-accent',
}

export default function RiskMiniSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="md:fixed md:top-24 md:right-10 md:w-[200px] mx-6 md:mx-0 mb-6 md:mb-0 bg-card border border-white/8 rounded-xl p-4"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <AlertTriangle size={13} className="text-warning" aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
          Today's risk
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {MINI_TASKS.map((t) => (
          <div key={t.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-zinc-400 truncate pr-2">{t.name}</span>
              <span className="text-[11px] font-bold text-zinc-300 flex-shrink-0">{t.risk}%</span>
            </div>
            <div className="h-1 bg-card2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${LEVEL_COLOR[t.level]}`}
                style={{ width: `${t.risk}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
