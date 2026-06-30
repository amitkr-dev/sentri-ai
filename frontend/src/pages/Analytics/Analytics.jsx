import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, TrendingUp, Cpu, RefreshCw, BarChart2, Sparkles } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

const WEEKLY_HOURS_DATA = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 3.0 },
  { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 4.5 },
  { day: 'Fri', hours: 2.0 },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days')
  const [recalculating, setRecalculating] = useState(false)
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const active = tasks.filter(t => t.status !== 'done')
  const completedCount = tasks.filter(t => t.status === 'done').length

  const avgRisk = active.length
    ? Math.round(active.reduce((sum, t) => sum + t.risk, 0) / active.length)
    : 0

  const focusScore = tasks.length ? Math.max(40, 100 - avgRisk) : 95
  const reclaimedHrs = parseFloat((8.5 + completedCount * 2.5).toFixed(1))
  const syncRate = parseFloat((99.2 + Math.min(0.7, completedCount * 0.1)).toFixed(1))

  const activeTrendData = useMemo(() => {
    const base = timeRange === '7days' ? 7 : 4
    const pts = []
    for (let i = 0; i < base; i++) {
      const label = timeRange === '7days' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Week ${i + 1}`
      const val = i === base - 1 ? focusScore : Math.max(50, Math.min(100, focusScore + (i - base / 2) * 4))
      pts.push({ name: label, score: Math.round(val) })
    }
    return pts
  }, [timeRange, focusScore])

  const handleRecalculate = () => {
    setRecalculating(true)
    setTimeout(() => {
      fetchTasks()
      setRecalculating(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* 1. Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Focus health score', value: `${focusScore}/100`, icon: Cpu, color: 'text-primary', desc: 'AI productivity ratio' },
          { label: 'Reclaimed focus hours', value: `${reclaimedHrs} hrs`, icon: Clock, color: 'text-accent', desc: 'Reallocated calendar blocks' },
          { label: 'Calendar sync rate', value: `${syncRate}%`, icon: TrendingUp, color: 'text-warning', desc: 'Google Calendar API health' }
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 border border-zinc-805 bg-card flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">{card.label}</span>
              <h3 className="text-2xl font-black text-white leading-none">{card.value}</h3>
              <p className="text-[10px] text-zinc-500">{card.desc}</p>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <card.icon size={18} className={card.color} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Top Control bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-card border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-white">Performance Insights</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-300 outline-none cursor-pointer"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {/* Action Trigger */}
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Syncing...' : 'Sync AI Audit'}
          </button>
        </div>
      </div>

      {/* 3. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Trend Area Chart */}
        <div className="lg:col-span-3 bg-card border border-zinc-800 rounded-2xl p-5">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Productivity Score Trend</h4>
            <p className="text-[11px] text-zinc-550 mt-0.5">Calculated based on protected focus locks completed</p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs shadow-xl">
                        <p className="text-zinc-500">{payload[0].payload.name}</p>
                        <p className="font-bold text-white mt-0.5">{payload[0].value}% Focus Index</p>
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-zinc-800 rounded-2xl p-5">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Focus Reclaimed</h4>
            <p className="text-[11px] text-zinc-550 mt-0.5">Hours saved by Sentri autopilot auto-declining syncs</p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_HOURS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs shadow-xl">
                        <p className="text-zinc-500">{payload[0].payload.day}</p>
                        <p className="font-bold text-accent mt-0.5">+{payload[0].value} hours saved</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Heatmap block representation */}
      <div className="bg-card border border-zinc-800 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Focus Intensity Heatmap</h4>
            <p className="text-[11px] text-zinc-550 mt-0.5">Visual representation of daily focus indexes across last 4 weeks</p>
          </div>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Sparkles size={11} className="text-primary" /> updated real time</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 select-none">
          {Array.from({ length: 4 }).map((_, weekIdx) => (
            <div key={weekIdx} className="space-y-1.5">
              <span className="block text-[9px] text-zinc-600 font-bold uppercase tracking-wider text-center mb-1">Wk {weekIdx + 1}</span>
              {Array.from({ length: 5 }).map((_, dayIdx) => {
                const multiplier = tasks.filter(t => t.status === 'done').length > 2 ? 1.2 : 0.8
                const val = (((weekIdx * 3 + dayIdx * 7) % 10) / 10) * multiplier
                const randomVal = Math.min(1, Math.max(0.1, val))
                
                let color = 'bg-zinc-900/60'
                if (randomVal > 0.7) color = 'bg-primary'
                else if (randomVal > 0.4) color = 'bg-primary/50'
                else if (randomVal > 0.1) color = 'bg-primary/20'

                return (
                  <div
                    key={dayIdx}
                    title={`Focus Level: ${Math.round(randomVal * 100)}%`}
                    className={`w-12 h-12 rounded-xl transition-all duration-300 hover:scale-105 border border-white/5 flex flex-col items-center justify-center ${color}`}
                  >
                    <span className="text-[10px] font-black text-white">{Math.round(randomVal * 100)}%</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
