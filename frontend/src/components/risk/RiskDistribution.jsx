import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function RiskDistribution({ tasks }) {
  const active = tasks.filter(t => t.status !== 'done')
  const high = active.filter(t => t.risk >= 75).length
  const medium = active.filter(t => t.risk >= 50 && t.risk < 75).length
  const low = active.filter(t => t.risk < 50).length
  const total = active.length || 1

  const data = [
    { name: 'High',   value: high,   color: '#ef4444' },
    { name: 'Medium', value: medium, color: '#f59e0b' },
    { name: 'Low',    value: low,    color: '#22c55e' },
  ]

  const avgRisk = active.length
    ? Math.round(active.reduce((sum, t) => sum + t.risk, 0) / active.length)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      <h3 className="text-sm font-bold text-white mb-1">Risk Distribution</h3>
      <p className="text-xs text-zinc-500 mb-4">{active.length} active tasks across your portfolio</p>

      <div className="relative flex items-center justify-center" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-white tabular-nums leading-none">{avgRisk}%</span>
          <span className="text-xs text-zinc-600 font-semibold mt-1">Avg Risk</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map((d) => (
          <div key={d.name} className="text-center rounded-xl py-2.5" style={{ background: `${d.color}10`, border: `1px solid ${d.color}25` }}>
            <div className="text-lg font-black tabular-nums" style={{ color: d.color }}>{d.value}</div>
            <div className="text-xs text-zinc-500 font-medium">{d.name}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
