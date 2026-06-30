import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const DATA = [
  { day: 'Mon', risk: 45 },
  { day: 'Tue', risk: 62 },
  { day: 'Wed', risk: 55 },
  { day: 'Thu', risk: 78 },
  { day: 'Fri', risk: 68 },
  { day: 'Sat', risk: 42 },
  { day: 'Sun', risk: 61 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{
        background: 'rgba(30,30,36,0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(12px)',
      }}>
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-white">{payload[0].value}<span className="text-zinc-400 font-normal text-xs">% risk</span></p>
    </div>
  )
}

export default function RiskChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(24,24,27,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-white">Risk Timeline</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Past 7 days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
          <Area
            type="monotoneX"
            dataKey="risk"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#riskGrad)"
            dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#1e1e24' }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
