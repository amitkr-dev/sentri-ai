import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import RiskDistribution from '../../components/risk/RiskDistribution'
import SignalBreakdown from '../../components/risk/SignalBreakdown'
import RiskRankedList from '../../components/risk/RiskRankedList'
import PortfolioRiskTrend from '../../components/risk/PortfolioRiskTrend'

function HeaderStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 flex-1"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-lg font-black text-white leading-none tabular-nums">{value}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function RiskAnalysis() {
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const active = tasks.filter(t => t.status !== 'done')
  const highest = useMemo(() => [...active].sort((a, b) => b.risk - a.risk)[0], [active])
  const [selectedId, setSelectedId] = useState(highest?.id)

  const selectedTask = active.find(t => t.id === selectedId) || highest

  const high = active.filter(t => t.risk >= 75).length
  const aiManaged = active.filter(t => t.aiManaged).length
  const avgRisk = active.length ? Math.round(active.reduce((s, t) => s + t.risk, 0) / active.length) : 0

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <HeaderStat icon={AlertTriangle} label="High-risk tasks" value={high} color="#ef4444" />
        <HeaderStat icon={TrendingUp}    label="Average portfolio risk" value={`${avgRisk}%`} color="#f59e0b" />
        <HeaderStat icon={Shield}        label="AI actively managing" value={aiManaged} color="#22c55e" />
      </div>

      {/* Main grid: distribution + ranked list left, trend + breakdown right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <RiskDistribution tasks={tasks} />
          <RiskRankedList tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="lg:col-span-3 space-y-5">
          <PortfolioRiskTrend />
          <SignalBreakdown task={selectedTask} />
        </div>
      </div>
    </div>
  )
}
