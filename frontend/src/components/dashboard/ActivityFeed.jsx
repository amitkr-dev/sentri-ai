import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle2, CalendarClock, TrendingDown, ChevronRight, X } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

const ICON_MAP = {
  zap: Zap,
  check: CheckCircle2,
  calendar: CalendarClock,
  risk: TrendingDown
}

const COLOR_MAP = {
  zap: '#ef4444',
  check: '#22c55e',
  calendar: '#6366f1',
  risk: '#a78bfa'
}

function timeAgo(dateString) {
  if (!dateString) return 'Recent'
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return 'Yesterday'
}

export default function ActivityFeed() {
  const { activityLogs, fetchTasks } = useTaskStore()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  // Show top 5 logs
  const displayLogs = activityLogs.slice(0, 5)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            <p className="text-xs text-zinc-500 mt-0.5">What Sentri did autonomously</p>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-indigo-300 transition-colors flex-shrink-0"
          >
            Full log <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-1">
          {displayLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No recent autonomous activity logs.
            </div>
          ) : (
            displayLogs.map((item, i) => {
              const Icon = ICON_MAP[item.iconType] || Zap
              const color = COLOR_MAP[item.iconType] || '#ef4444'
              return (
                <motion.div
                  key={item.id || (item.title + i)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors duration-200 cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p>
                    <p className="text-xs text-zinc-600 truncate">{item.sub}</p>
                  </div>
                  <span className="text-xs text-zinc-700 flex-shrink-0 whitespace-nowrap">{timeAgo(item.createdAt)}</span>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <div>
                  <h3 className="text-base font-bold text-white">Autopilot Activity Log</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Sentri's complete historical autonomous operations</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-500">
                    No autonomous operations logged.
                  </div>
                ) : (
                  activityLogs.map((item, i) => {
                    const Icon = ICON_MAP[item.iconType] || Zap
                    const color = COLOR_MAP[item.iconType] || '#ef4444'
                    return (
                      <div
                        key={item.id || (item.title + i)}
                        className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/3 border border-zinc-900 cursor-default hover:bg-white/5 transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-zinc-200 truncate">{item.title}</p>
                            <span className="text-[10px] text-zinc-650">{timeAgo(item.createdAt)}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.sub}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
