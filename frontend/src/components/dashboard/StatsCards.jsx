import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Shield, Clock } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

function useCounter(target, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setVal(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return val
}

function StatsCard({ title, value, unit, icon: Icon, gradient, glowColor, trend, trendLabel, delay = 0 }) {
  const count = useCounter(parseInt(value) || 0, 1000, delay)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-5 cursor-pointer group overflow-hidden bg-card border border-white/5"
    >
      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${glowColor}40, 0 0 30px ${glowColor}20` }}
      />

      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: gradient }} />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${glowColor}15`, border: `1px solid ${glowColor}30` }}
      >
        <Icon size={18} style={{ color: glowColor }} />
      </div>

      {/* Value */}
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-black text-white tabular-nums">{count}</span>
        {unit && <span className="text-lg font-bold text-zinc-400 mb-0.5">{unit}</span>}
      </div>

      {/* Title */}
      <p className="text-xs text-zinc-500 font-medium">{title}</p>

      {/* Trend */}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[10px] font-semibold ${trend > 0 ? 'text-red-400' : 'text-accent'}`}>
          <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
          <span className="text-zinc-650 font-normal">{trendLabel}</span>
        </div>
      )}

      {/* BG blob */}
      <div
        className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
      />
    </motion.div>
  )
}

export default function StatsCards() {
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const active = tasks.filter(t => t.status !== 'done')
  const completed = tasks.filter(t => t.status === 'done').length
  const atRisk = active.filter(t => t.risk >= 75).length
  
  const avgRisk = active.length 
    ? Math.round(active.reduce((sum, t) => sum + t.risk, 0) / active.length)
    : 0
    
  const onTimeRate = tasks.length
    ? Math.round(((tasks.length - atRisk) / tasks.length) * 100)
    : 100

  const CARDS = [
    {
      title: 'At Risk Tasks',
      value: atRisk,
      icon: AlertTriangle,
      gradient: 'linear-gradient(90deg, #ef4444, transparent)',
      glowColor: '#ef4444',
      trend: atRisk > 1 ? 14 : -10,
      trendLabel: 'vs yesterday',
      delay: 0.1
    },
    {
      title: 'Completed List',
      value: completed,
      icon: CheckCircle,
      gradient: 'linear-gradient(90deg, #22c55e, transparent)',
      glowColor: '#22c55e',
      trend: -5,
      trendLabel: 'vs yesterday',
      delay: 0.2
    },
    {
      title: 'Average Risk',
      value: avgRisk,
      unit: '%',
      icon: Shield,
      gradient: 'linear-gradient(90deg, #f59e0b, transparent)',
      glowColor: '#f59e0b',
      trend: avgRisk > 50 ? 5 : -15,
      trendLabel: 'vs yesterday',
      delay: 0.3
    },
    {
      title: 'On-Time Schedule',
      value: onTimeRate,
      unit: '%',
      icon: Clock,
      gradient: 'linear-gradient(90deg, #6366f1, transparent)',
      glowColor: '#6366f1',
      trend: onTimeRate > 90 ? 2 : -4,
      trendLabel: 'vs yesterday',
      delay: 0.4
    }
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map((card) => <StatsCard key={card.title} {...card} />)}
    </div>
  )
}
