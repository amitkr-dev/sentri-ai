import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

const getRiskColor = (risk) => {
  if (risk >= 75) return '#ef4444'
  if (risk >= 50) return '#f59e0b'
  return '#22c55e'
}

export default function UpcomingDeadlines() {
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  // Filter tasks that are in progress or todo, and have a deadline
  const activeTasksWithDeadlines = tasks
    .filter(t => t.status !== 'done' && t.deadline)
    .sort((a, b) => b.risk - a.risk) // Show riskiest ones first or soonest (we sort by risk to match visual design)
    .slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-zinc-500" />
          <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary hover:text-indigo-300 transition-colors">
          Calendar <ChevronRight size={12} />
        </button>
      </div>

      <div className="relative">
        {activeTasksWithDeadlines.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No upcoming active deadlines.
          </div>
        ) : (
          activeTasksWithDeadlines.map((d, i) => {
            const color = getRiskColor(d.risk)
            return (
              <div key={d.id || d.title} className="flex gap-4 relative">
                {/* Dot + line */}
                <div className="flex flex-col items-center w-3 flex-shrink-0 pt-1.5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    className="w-3 h-3 rounded-full flex-shrink-0 z-10"
                    style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
                  />
                  {i < activeTasksWithDeadlines.length - 1 && (
                    <div className="w-px flex-1 min-h-8 my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className="pb-5 flex-1 min-w-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-300">{d.deadline}</span>
                      {d.deadlineDisplay && (
                        <span className="text-xs text-zinc-650 ml-1.5">{d.deadlineDisplay}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: `${color}15`, color: color }}>
                      {d.risk}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-100 mt-0.5 truncate">{d.title}</p>
                </motion.div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
