import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const DATA = [
  { day: 'Jun 17', avgRisk: 38 }, { day: 'Jun 18', avgRisk: 42 },
  { day: 'Jun 19', avgRisk: 51 }, { day: 'Jun 20', avgRisk: 47 },
  { day: 'Jun 21', avgRisk: 60 }, { day: 'Jun 22', avgRisk: 55 },
  { day: 'Jun 23', avgRisk: 49 }, { day: 'Jun 24', avgRisk: 58 },
  { day: 'Jun 25', avgRisk: 67 }, { day: 'Jun 26', avgRisk: 62 },
  { day: 'Jun 27', avgRisk: 71 }, { day: 'Jun 28', avgRisk: 64 },
  { day: 'Jun 29', avgRisk: 56 }, { day: 'Jun 30', avgRisk: 48 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{ background: 'rgba(30,30,36,0.95)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(12px)' }}>
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-white">{payload[0].value}<span className="text-zinc-400 font-normal text-xs">% avg risk</span></p>
    </div>
  )
}

export default function PortfolioRiskTrend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Portfolio Risk Trend</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Average risk across all active tasks, last 14 days</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Down 12% this week
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <ReferenceLine y={75} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="avgRisk"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#1e1e24' }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
