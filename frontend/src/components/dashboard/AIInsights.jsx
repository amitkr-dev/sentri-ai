import { motion } from 'framer-motion'
import { Bot, Sparkles, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

function getIcon(type) {
  if (type === 'danger') return AlertTriangle
  if (type === 'warning') return TrendingDown
  return CheckCircle
}

export default function AIInsights() {
  const { aiInsights, aiInsightsLoading } = useTaskStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(24,24,27,0.8)',
        border: '1px solid rgba(99,102,241,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Animated border glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)' }}
      />

      {/* BG glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <Bot size={16} className="text-primary" />
        </motion.div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Insights</h3>
          <p className="text-xs text-zinc-500">Powered by Sentri AI</p>
        </div>
        <Sparkles size={14} className="ml-auto text-primary opacity-60" />
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {aiInsightsLoading || aiInsights.length === 0 ? (
          // Pulsing skeleton loader
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex gap-3 p-3 rounded-xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800/80 flex-shrink-0" />
              <div className="flex-1 space-y-2 mt-0.5">
                <div className="h-3.5 bg-zinc-800/80 rounded w-5/6" />
                <div className="h-2.5 bg-zinc-800/50 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          aiInsights.map((ins, i) => {
            const Icon = getIcon(ins.type)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="flex gap-3 p-3 rounded-xl group cursor-pointer transition-all duration-200 hover:bg-white/4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${ins.color}15`, border: `1px solid ${ins.color}30` }}
                >
                  <Icon size={13} style={{ color: ins.color }} />
                </div>
                <div>
                  <p className="text-xs text-zinc-200 font-medium leading-snug">{ins.text}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{ins.sub}</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
