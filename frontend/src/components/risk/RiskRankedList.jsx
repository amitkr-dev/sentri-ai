import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'
import { riskTier } from '../../data/tasksData'

export default function RiskRankedList({ tasks, selectedId, onSelect }) {
  const sorted = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => b.risk - a.risk)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      <h3 className="text-sm font-bold text-white mb-1">Ranked by Risk</h3>
      <p className="text-xs text-zinc-500 mb-4">Click any task to see its signal breakdown</p>

      <div className="space-y-1.5">
        {sorted.map((t, i) => {
          const rc = riskTier(t.risk)
          const isSelected = t.id === selectedId
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
              style={{
                background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span className="text-xs font-bold w-5 flex-shrink-0" style={{ color: rc.color }}>#{i + 1}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{t.title}</p>
                  {t.aiManaged && <Sparkles size={10} className="text-primary flex-shrink-0" />}
                </div>
                <span className="flex items-center gap-1 text-xs text-zinc-600 mt-0.5">
                  <Clock size={10} /> {t.deadline}
                </span>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black tabular-nums" style={{ color: rc.color }}>{t.risk}%</div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
