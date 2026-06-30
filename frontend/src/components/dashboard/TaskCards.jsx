import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, Zap, ChevronRight, Check } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { db, auth } from '../../firebase/config'

function riskConfig(risk) {
  if (risk >= 75) return { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   bar: '#ef4444' }
  if (risk >= 50) return { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  bar: '#f59e0b' }
  return           { label: 'Low',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   bar: '#22c55e' }
}

function TaskCard({ task, i, onComplete }) {
  const rc = riskConfig(task.risk)
  const [checking, setChecking] = useState(false)

  const handleCheck = () => {
    setChecking(true)
    setTimeout(() => {
      onComplete(task.id)
    }, 400)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, delay: 0.1 * i }}
      className="group relative rounded-xl p-4 flex items-center gap-3 bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-200"
    >
      {/* Checkbox */}
      <button
        onClick={handleCheck}
        disabled={checking}
        className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
          checking
            ? 'bg-accent border-accent text-white scale-90'
            : 'border-white/15 hover:border-primary/50 text-transparent'
        }`}
      >
        <Check size={11} strokeWidth={3} className={checking ? 'opacity-100' : 'opacity-0'} />
      </button>

      <div className="flex-1 min-w-0">
        {/* Title + tag */}
        <div className="flex items-center gap-2 mb-1.5">
          <p className={`text-sm font-semibold text-zinc-100 truncate ${checking ? 'line-through opacity-40' : ''}`}>
            {task.title}
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-white/5 text-zinc-400">
            {task.tag}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-2 bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${task.risk}%` }}
            transition={{ duration: 0.8, delay: 0.2 * i, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: rc.bar, boxShadow: `0 0 6px ${rc.bar}60` }}
          />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}30` }}>
            {rc.label} · {task.risk}%
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Clock size={10} /> {task.deadline}
          </span>
          {task.aiAnalysis ? (
            <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              AI Verified
            </span>
          ) : (!!db && !!auth?.currentUser?.uid) ? (
            <span className="text-[9px] font-bold bg-white/5 text-zinc-500 border border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              Analyzing...
            </span>
          ) : null}
        </div>
      </div>

      {/* Action */}
      <Link
        to="/app/risk"
        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 active:scale-95"
      >
        <Zap size={11} />
        Analyze
      </Link>
    </motion.div>
  )
}

export default function TaskCards() {
  const { tasks, fetchTasks, updateTask } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const active = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 4)

  const handleComplete = async (id) => {
    const found = tasks.find(t => t.id === id)
    if (found) {
      await updateTask(id, {
        status: 'done',
        prevRisk: found.risk,
        risk: 0,
        deadline: 'Completed today'
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-2xl p-5 bg-card border border-zinc-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Active Tasks</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{active.length} tasks requiring attention</p>
        </div>
        <Link to="/app/tasks" className="flex items-center gap-1 text-xs text-primary hover:text-indigo-300 transition-colors">
          View all <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {active.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No active tasks remaining. Add some tasks to begin!
            </div>
          ) : (
            active.map((task, i) => (
              <TaskCard key={task.id} task={task} i={i} onComplete={handleComplete} />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
