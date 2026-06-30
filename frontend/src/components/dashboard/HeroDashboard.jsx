import { motion } from 'framer-motion'

const RISK_CARDS = [
  { label: 'At Risk',     value: '3',   color: 'text-danger',  note: '↑ 2 since yesterday' },
  { label: 'Rescued',     value: '7',   color: 'text-accent',  note: 'This week'            },
  { label: 'Avg Risk',    value: '62%', color: 'text-warning', note: '↓ 14% from last'      },
  { label: 'Tasks Done',  value: '24',  color: 'text-primary', note: 'On-time rate 91%'     },
]

const TASKS = [
  { name: 'Hackathon Submission', risk: '91%', level: 'high', dot: '#ef4444' },
  { name: 'Q3 Report Draft',      risk: '58%', level: 'med',  dot: '#f59e0b' },
  { name: 'API Integration',      risk: '12%', level: 'low',  dot: '#22c55e' },
]

const riskBadge = {
  high: 'bg-danger/15 text-danger',
  med:  'bg-warning/15 text-warning',
  low:  'bg-accent/15 text-accent',
}

export default function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      className="animate-float"
    >
      <div className="bg-card/80 border border-white/8 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Live Risk Feed
          </span>
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#22c55e] animate-pulse-dot" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {RISK_CARDS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-card2 border border-white/5 rounded-xl p-3.5 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 animate-float-card cursor-default"
              style={{ animationDelay: `${i * -2}s` }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                {c.label}
              </div>
              <div className={`text-2xl font-black tracking-tight ${c.color}`}>{c.value}</div>
              <div className="text-[11px] text-zinc-600 mt-1">{c.note}</div>
            </motion.div>
          ))}
        </div>

        {/* Task feed */}
        <div className="flex flex-col gap-2">
          {TASKS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.15 }}
              className="flex items-center gap-2.5 bg-card2 border border-white/5 rounded-xl px-3 py-2.5"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: t.dot, boxShadow: `0 0 6px ${t.dot}` }}
              />
              <span className="text-xs font-medium flex-1">{t.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${riskBadge[t.level]}`}>
                {t.risk}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
