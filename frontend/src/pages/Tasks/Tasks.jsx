import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Zap, Clock, CheckCircle2, X, Sparkles,
  ArrowUpDown, Filter, Check, Brain, Calendar, AlertTriangle,
  ArrowRight, TrendingDown, Info
} from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

function getRiskConfig(risk) {
  if (risk >= 75) {
    return {
      label: 'High',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'text-danger'
    }
  }
  if (risk >= 50) {
    return {
      label: 'Medium',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: 'text-warning'
    }
  }
  return {
    label: 'Low',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: 'text-accent'
  }
}

const DEADLINE_ORDER = {
  'Tomorrow': 1,
  'In 2 days': 2,
  'In 3 days': 3,
  'In 4 days': 4,
  'In 5 days': 5,
  'Next week': 6
}

export default function Tasks() {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, activateRescue, saveCalendarEvent, searchQuery, setSearchQuery } = useTaskStore()
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('risk-desc')
  const [selectedTasks, setSelectedTasks] = useState(new Set())

  // Modal and Drawer states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTaskDetails, setActiveTaskDetails] = useState(null)
  const [activeRescueTask, setActiveRescueTask] = useState(null)
  const [regeneratingDraft, setRegeneratingDraft] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)

  const handleRegenerateDraft = async (task) => {
    setRegeneratingDraft(true)
    try {
      const { geminiService } = await import('../../services/ai.service')
      console.log("[DEBUG] Regenerating Ghost Draft client-side...")
      const updatedDraft = await geminiService.generateGhostDraft(task)
      
      // Update in task store/Firestore
      await updateTask(task.id, {
        ghostDraft: updatedDraft
      })
      
      // Update local state details to reflect changes immediately
      setActiveTaskDetails(prev => prev ? { ...prev, ghostDraft: updatedDraft } : null)
      console.log("[DEBUG] Ghost Draft regenerated successfully:", updatedDraft)
    } catch (err) {
      console.error("[ERROR] Failed to regenerate draft:", err)
    } finally {
      setRegeneratingDraft(false)
    }
  }

  // Add Task Form states
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTag, setNewTag] = useState('Dev')
  const [newDeadline, setNewDeadline] = useState('Tomorrow')
  const [newRisk, setNewRisk] = useState(50)

  // Simulation loading states
  const [isRescuing, setIsRescuing] = useState(false)
  const [rescueStep, setRescueStep] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  // Unique tags
  const tags = useMemo(() => {
    const allTags = tasks.map(t => t.tag)
    return ['All', ...new Set(allTags)]
  }, [tasks])

  // Filter & Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesTag = selectedTag === 'All' || task.tag === selectedTag

        const matchesStatus =
          selectedStatus === 'All' ||
          (selectedStatus === 'Active' && task.status !== 'done') ||
          (selectedStatus === 'Completed' && task.status === 'done')

        return matchesSearch && matchesTag && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'risk-desc') return b.risk - a.risk
        if (sortBy === 'risk-asc') return a.risk - b.risk
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        if (sortBy === 'deadline') {
          const wA = DEADLINE_ORDER[a.deadline] || 99
          const wB = DEADLINE_ORDER[b.deadline] || 99
          return wA - wB
        }
        return 0
      })
  }, [tasks, searchQuery, selectedTag, selectedStatus, sortBy])

  // Statistics Computations
  const stats = useMemo(() => {
    const total = tasks.length
    const active = tasks.filter(t => t.status !== 'done')
    const highRisk = active.filter(t => t.risk >= 75).length
    const completed = tasks.filter(t => t.status === 'done').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgRisk = active.length > 0
      ? Math.round(active.reduce((acc, t) => acc + t.risk, 0) / active.length)
      : 0

    return { total, highRisk, completed, completionRate, avgRisk }
  }, [tasks])

  // Handlers
  const handleToggleComplete = async (id) => {
    const found = tasks.find(t => t.id === id)
    if (found) {
      const isCompleted = found.status === 'done'
      await updateTask(id, {
        status: isCompleted ? 'in_progress' : 'done',
        risk: !isCompleted ? 0 : (found.prevRisk || 50),
        prevRisk: !isCompleted ? found.risk : undefined
      })
    }
  }

  const handleDeleteTask = async (id) => {
    await deleteTask(id)
    setSelectedTasks(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (activeTaskDetails && activeTaskDetails.id === id) {
      setActiveTaskDetails(null)
    }
  }

  const handleSelectTask = (id) => {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  // Bulk operations
  const handleBulkComplete = async () => {
    for (const id of selectedTasks) {
      const found = tasks.find(t => t.id === id)
      if (found) {
        await updateTask(id, {
          status: 'done',
          risk: 0,
          prevRisk: found.risk
        })
      }
    }
    setSelectedTasks(new Set())
  }

  const handleBulkDelete = async () => {
    for (const id of selectedTasks) {
      await deleteTask(id)
    }
    setSelectedTasks(new Set())
  }

  const handleBulkRescue = async () => {
    for (const id of selectedTasks) {
      const found = tasks.find(t => t.id === id)
      if (found && found.risk >= 75 && found.status !== 'done') {
        await updateTask(id, {
          risk: Math.max(15, Math.round(found.risk * 0.3)),
          reasoning: ['Sentri Calendar Rescue active.', 'Blocked focus block applied (3h/day).']
        })
        const newBlock = {
          id: 'evt_rescue_' + found.id,
          title: `Focus Block: ${found.title}`,
          source: 'ai_focus',
          start: 13,
          end: 16,
          reason: 'Autopilot locked down focus block after bulk rescue.'
        }
        await saveCalendarEvent(newBlock)
      }
    }
    setSelectedTasks(new Set())
    window.dispatchEvent(new Event('calendarUpdated'))
  }

  // Create Task Form Handler
  const handleAddTask = async (e) => {
    e.preventDefault()
    console.log("Submit button clicked")
    if (!newTitle.trim()) {
      return
    }
    setIsAddingTask(true)

    const newTask = {
      id: 't_' + Date.now(),
      title: newTitle,
      description: newDesc || 'No details provided.',
      risk: Number(newRisk),
      deadline: newDeadline,
      tag: newTag,
      status: 'in_progress',
      reasoning: [
        'Initial assessment set by manual creation.',
        `Estimated risk factor calculated at ${newRisk}%.`
      ]
    }

    try {
      console.log("store.createTask() started with task:", newTask)
      await createTask(newTask)
      console.log("store.createTask() success")
      setIsAddModalOpen(false)
      setNewTitle('')
      setNewDesc('')
      setNewTag('Dev')
      setNewDeadline('Tomorrow')
      setNewRisk(50)
    } catch (err) {
      console.error("store.createTask() failed:", err)
    } finally {
      setIsAddingTask(false)
    }
  }


  // AI Rescue simulator execution
  const runCalendarRescue = (task) => {
    setIsRescuing(true)
    setRescueStep('Analyzing meeting hierarchy...')

    setTimeout(() => {
      setRescueStep('Declining overlapping syncs (2.5h freed)...')
    }, 800)

    setTimeout(() => {
      setRescueStep('Establishing deep focus block in Calendar...')
    }, 1600)

    setTimeout(() => {
      setRescueStep('Syncing risk vectors...')
    }, 2400)

    setTimeout(async () => {
      await activateRescue(task.id)
      setIsRescuing(false)
      setActiveRescueTask(null)

      if (activeTaskDetails && activeTaskDetails.id === task.id) {
        setActiveTaskDetails(prev => ({
          ...prev,
          risk: 24,
          reasoning: [
            'Sentri optimized calendar parameters successfully.',
            'Declined 2 secondary syncs.',
            'Created locked 5-hour focus block (11:00 AM - 4:05 PM).'
          ]
        }))
      }
    }, 3200)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Tasks <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{filteredAndSortedTasks.length} Listable</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Review active deadlines, audit risk vectors, and secure your schedule.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-indigo-500 active:scale-95 transition-all text-xs font-bold text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 border border-primary/20"
        >
          <Plus size={14} /> Add New Task
        </button>
      </div>

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total active tasks', value: tasks.filter(t => t.status !== 'done').length, icon: Brain, gradient: 'from-blue-500/10 to-indigo-500/10', text: 'text-primary' },
          { label: 'High risk alerts', value: stats.highRisk, icon: AlertTriangle, gradient: 'from-red-500/10 to-pink-500/10', text: stats.highRisk > 0 ? 'text-danger animate-pulse' : 'text-zinc-400' },
          { label: 'Completed tasks', value: stats.completed, icon: CheckCircle2, gradient: 'from-green-500/10 to-emerald-500/10', text: 'text-accent' },
          { label: 'Completion rate', value: `${stats.completionRate}%`, icon: Clock, gradient: 'from-violet-500/10 to-fuchsia-500/10', text: 'text-white' }
        ].map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 border border-zinc-800/80 bg-gradient-to-br ${card.gradient}`}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{card.label}</span>
              <card.icon size={16} className={`${card.text}`} />
            </div>
            <h3 className="text-2xl font-black text-white mt-2 leading-none">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* 3. Filter & Sort Panel */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-card border border-zinc-800/70" style={{ backdropFilter: 'blur(10px)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by task title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/85 px-3 py-1.5 rounded-xl">
              <Filter size={11} className="text-zinc-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 font-semibold outline-none cursor-pointer"
              >
                <option value="All" className="bg-zinc-900 text-zinc-300">All Status</option>
                <option value="Active" className="bg-zinc-900 text-zinc-300">Active</option>
                <option value="Completed" className="bg-zinc-900 text-zinc-300">Completed</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/85 px-3 py-1.5 rounded-xl">
              <ArrowUpDown size={11} className="text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 font-semibold outline-none cursor-pointer"
              >
                <option value="risk-desc" className="bg-zinc-900 text-zinc-300">Risk: High to Low</option>
                <option value="risk-asc" className="bg-zinc-900 text-zinc-300">Risk: Low to High</option>
                <option value="deadline" className="bg-zinc-900 text-zinc-300">Deadline: Soonest</option>
                <option value="title" className="bg-zinc-900 text-zinc-300">Alphabetical A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide border-t border-zinc-800/40 pt-3">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-2 flex-shrink-0">Filter Tag:</span>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-zinc-950/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Task List & Columns */}
      <div className="rounded-2xl border border-zinc-800 bg-card overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 items-center gap-3 px-6 py-3.5 bg-zinc-900/40 border-b border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={filteredAndSortedTasks.length > 0 && selectedTasks.size === filteredAndSortedTasks.length}
              className="rounded border-zinc-800 bg-zinc-950 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="col-span-4">Task</div>
          <div className="col-span-3">AI Risk Score</div>
          <div className="col-span-2">Deadline</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-zinc-800/60 min-h-[200px]">
          <AnimatePresence initial={false}>
            {filteredAndSortedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-500 mb-3 border border-zinc-800">
                  <Check size={18} />
                </div>
                <h4 className="text-sm font-bold text-zinc-300">No tasks found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">Try clearing search parameters or filters to load tasks.</p>
              </motion.div>
            ) : (
              filteredAndSortedTasks.map((task, index) => {
                const rc = getRiskConfig(task.risk)
                const isSelected = selectedTasks.has(task.id)
                const isCompleted = task.status === 'done'

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className={`grid grid-cols-12 items-center gap-3 px-6 py-4 transition-all duration-150 hover:bg-zinc-900/10 ${
                      isCompleted ? 'opacity-55' : ''
                    } ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    
                    {/* Select Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-zinc-800 bg-zinc-950 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Task Title & Details */}
                    <div className="col-span-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-accent/20 border-accent text-accent animate-pulse'
                              : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                          }`}
                        >
                          {isCompleted && <Check size={10} strokeWidth={3} />}
                        </button>
                        <span
                          onClick={() => setActiveTaskDetails(task)}
                          className={`text-sm font-semibold cursor-pointer select-none hover:text-primary transition-colors truncate ${
                            isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 capitalize">
                          {task.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-1 pl-6">{task.description}</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="col-span-3 pr-6">
                      {isCompleted ? (
                        <span className="text-xs font-semibold text-accent flex items-center gap-1">
                          <CheckCircle2 size={12} /> Task Cleared
                        </span>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold flex items-center gap-1" style={{ color: rc.color }}>
                              {rc.label} · {task.risk}%
                            </span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: rc.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${task.risk}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="col-span-2 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                      <Clock size={12} className={task.risk >= 75 && !isCompleted ? 'text-danger animate-pulse' : 'text-zinc-500'} />
                      <span>{task.deadline}</span>
                    </div>

                    {/* Action Panel */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveTaskDetails(task)}
                        title="Audit risk breakdown"
                        className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
                      >
                        <Info size={13} />
                      </button>

                      {!isCompleted && task.risk >= 75 && (
                        <button
                          onClick={() => setActiveRescueTask(task)}
                          title="Apply Sentri Calendar Rescue"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all active:scale-95 text-[10px] font-bold"
                        >
                          <Zap size={11} className="animate-pulse" /> Rescue
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task"
                        className="p-1.5 rounded-lg border border-zinc-800/80 hover:border-danger/30 bg-zinc-950 text-zinc-500 hover:text-danger transition-all active:scale-95"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 5. Sticky Bulk Actions Bar */}
      <AnimatePresence>
        {selectedTasks.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-955/95 border border-zinc-800 rounded-2xl px-5 py-3 shadow-2xl z-40 max-w-[90%] w-[580px] justify-between"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center border border-primary/20 text-xs font-bold text-primary">
                {selectedTasks.size}
              </div>
              <span className="text-xs text-zinc-300 font-bold">selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkComplete}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] font-bold transition-all active:scale-95"
              >
                Mark Completed
              </button>

              <button
                onClick={handleBulkRescue}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 hover:bg-primary/35 text-primary text-[10px] font-bold transition-all active:scale-95"
              >
                <Zap size={11} /> Bulk Rescue High-Risk
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-danger/10 border border-danger/30 hover:bg-danger/25 text-danger text-[10px] font-bold transition-all active:scale-95"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedTasks(new Set())}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Add Task Modal Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/20">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> Create New Task
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-805 text-zinc-505 hover:text-zinc-305 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Code database migrations"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide context and requirements..."
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Tag & Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Category Tag</label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="Dev">Dev</option>
                      <option value="Design">Design</option>
                      <option value="Career">Career</option>
                      <option value="School">School</option>
                      <option value="Writing">Writing</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Deadline</label>
                    <select
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="In 2 days">In 2 days</option>
                      <option value="In 3 days">In 3 days</option>
                      <option value="In 4 days">In 4 days</option>
                      <option value="In 5 days">In 5 days</option>
                      <option value="Next week">Next week</option>
                    </select>
                  </div>
                </div>

                {/* Risk Slider */}
                <div className="space-y-1.5 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Estimated Risk Vector</label>
                    <span className="text-xs font-bold text-primary">{newRisk}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="99"
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-655 mt-1">
                    <span>10% Low Risk</span>
                    <span>99% High Risk</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 text-xs font-bold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                   <button
                    type="submit"
                    disabled={isAddingTask}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isAddingTask ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. AI Risk Drawer */}
      <AnimatePresence>
        {activeTaskDetails && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-xs" onClick={() => setActiveTaskDetails(null)} />
            
            <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
              
              <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800 bg-zinc-900/10">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  <span className="text-sm font-bold text-white">Sentri AI Risk Audit</span>
                </div>
                <button
                  onClick={() => setActiveTaskDetails(null)}
                  className="p-1 rounded-lg hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                      {activeTaskDetails.tag}
                    </span>
                    <span className="text-xs text-zinc-550 flex items-center gap-1">
                      <Clock size={11} /> {activeTaskDetails.deadline}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{activeTaskDetails.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{activeTaskDetails.description}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/20 border border-zinc-855/80 rounded-xl relative overflow-hidden">
                  <div className="relative w-28 h-28 flex items-center justify-center rounded-full border border-zinc-800">
                    <div
                      className="absolute inset-2.5 rounded-full flex flex-col items-center justify-center bg-zinc-950"
                      style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <span className="text-2xl font-black text-white">{activeTaskDetails.risk}%</span>
                      <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5">probability</span>
                    </div>

                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${getRiskConfig(activeTaskDetails.risk).color} ${activeTaskDetails.risk}%, transparent ${activeTaskDetails.risk}% 100%)`,
                        opacity: 0.7,
                        maskImage: 'radial-gradient(circle, transparent 86%, black 88%)',
                        WebkitMaskImage: 'radial-gradient(circle, transparent 86%, black 88%)'
                      }}
                    />
                  </div>

                  <h4 className="text-xs font-bold text-zinc-300 mt-4 flex items-center gap-1.5">
                    Miss Vector Rating: 
                    <span style={{ color: getRiskConfig(activeTaskDetails.risk).color }}>
                      {getRiskConfig(activeTaskDetails.risk).label} Risk
                    </span>
                  </h4>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-zinc-550">
                    <AlertTriangle size={12} className="text-warning" /> Contributing Factors
                  </h4>
                  <div className="space-y-2">
                    {activeTaskDetails.reasoning && activeTaskDetails.reasoning.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-zinc-900/30 border border-zinc-900 px-3.5 py-3 rounded-lg text-xs text-zinc-300 leading-relaxed">
                        <span className="text-primary font-bold mt-0.5">·</span>
                        <p>{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ghost Draft Section */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-zinc-550">
                    <Sparkles size={12} className="text-primary" /> Ghost Document Draft
                  </h4>
                  {activeTaskDetails.ghostDraft && (activeTaskDetails.ghostDraft.content || activeTaskDetails.ghostDraft.message) ? (
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-white truncate max-w-[200px]">
                          {activeTaskDetails.ghostDraft.title || `${activeTaskDetails.title} Draft`}
                        </h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const txt = activeTaskDetails.ghostDraft.content || activeTaskDetails.ghostDraft.message || ''
                              navigator.clipboard.writeText(txt)
                              alert('Draft copied to clipboard!')
                            }}
                            className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 rounded font-semibold transition-colors"
                          >
                            Copy Draft
                          </button>
                          <button
                            disabled={regeneratingDraft}
                            onClick={() => handleRegenerateDraft(activeTaskDetails)}
                            className="px-2 py-1 bg-primary/20 hover:bg-primary/35 text-[10px] text-primary rounded font-semibold transition-colors disabled:opacity-50"
                          >
                            {regeneratingDraft ? 'Regenerating...' : 'Regenerate'}
                          </button>
                        </div>
                      </div>
                      
                      {activeTaskDetails.ghostDraft.outline && activeTaskDetails.ghostDraft.outline.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Document Outline</span>
                          <div className="flex flex-wrap gap-1">
                            {activeTaskDetails.ghostDraft.outline.map((item, idx) => (
                              <span key={idx} className="text-[9px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-400">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Starter Content</span>
                        <div className="max-h-40 overflow-y-auto bg-zinc-950 p-3 rounded-lg border border-zinc-900 text-xs text-zinc-350 font-mono leading-relaxed whitespace-pre-wrap">
                          {activeTaskDetails.ghostDraft.content || activeTaskDetails.ghostDraft.message}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 text-center space-y-3">
                      <p className="text-xs text-zinc-500">No draft available for this task category yet.</p>
                      <button
                        disabled={regeneratingDraft}
                        onClick={() => handleRegenerateDraft(activeTaskDetails)}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-350 rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        {regeneratingDraft ? 'Generating Draft...' : 'Generate AI Starter Draft'}
                      </button>
                    </div>
                  )}
                </div>

                {activeTaskDetails.status !== 'done' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-zinc-550">
                      <Sparkles size={12} className="text-primary" /> Recommended Mitigation
                    </h4>
                    
                    {activeTaskDetails.risk >= 75 ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                        <h5 className="text-xs font-bold text-white flex items-center gap-1">
                          <Zap size={12} className="text-primary animate-pulse" /> Execute Calendar Rescue
                        </h5>
                        <p className="text-xs text-zinc-400 leading-normal">
                          Sentri predicts a 67% reduction in risk if you apply a dedicated focus block and automatically clear low-importance meetings.
                        </p>
                        <button
                          onClick={() => {
                            setActiveRescueTask(activeTaskDetails)
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-indigo-500 text-xs font-bold text-white rounded-lg active:scale-95 transition-all"
                        >
                          Launch Rescue Simulator <ArrowRight size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-4 space-y-2">
                        <h5 className="text-xs font-bold text-accent flex items-center gap-1">
                          <CheckCircle2 size={12} /> Buffer Protected
                        </h5>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Sentri model predicts this task is on track. No rescheduling or rescue intervention required at this time.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. AI Rescue Calendar Simulator Modal */}
      <AnimatePresence>
        {activeRescueTask && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
            >
              
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/30">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} className="text-primary animate-pulse" /> Sentri Calendar Rescue Mode
                </h3>
                <button
                  onClick={() => {
                    if (!isRescuing) setActiveRescueTask(null)
                  }}
                  disabled={isRescuing}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-zinc-550">OPTIMIZING FOR TASK:</h4>
                  <p className="text-sm font-semibold text-white">{activeRescueTask.title}</p>
                </div>

                {isRescuing ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Brain size={16} className="absolute text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-xs font-bold text-white">Sentri Agent active...</h4>
                      <p className="text-xs text-primary font-mono mt-1">{rescueStep}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Current Calendar (Blocker)</span>
                        <span className="text-xs font-black text-danger">91% Risk</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {[
                          { time: '09:00 AM', label: 'Standup Sync (1h)', conflict: true },
                          { time: '10:30 AM', label: 'Product Alignment (30m)', conflict: true },
                          { time: '01:00 PM', label: 'Design Critique (1h)', conflict: true },
                          { time: '03:00 PM', label: 'Code Sync (1h)', conflict: true }
                        ].map((event, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded bg-zinc-950/40 border border-red-500/20 text-zinc-400">
                            <span className="font-mono text-[10px]">{event.time}</span>
                            <span className="truncate max-w-[130px] font-medium">{event.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-zinc-500 text-center font-bold uppercase pt-1">
                        Protected Focus Time: <span className="text-danger">0.0h</span>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-primary/25 pb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Proposed Optimized Calendar</span>
                        <span className="text-xs font-black text-accent flex items-center gap-0.5">
                          <TrendingDown size={12} /> 24% Risk
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {[
                          { time: '09:00 AM', label: 'Standup Sync', action: 'Declined (Auto-summary)', color: 'text-zinc-550 line-through border-zinc-800/40' },
                          { time: '10:30 AM', label: 'Product Alignment', action: 'Declined (Auto-summary)', color: 'text-zinc-550 line-through border-zinc-800/40' },
                          { time: '11:00 AM - 04:00 PM', label: 'Focus Block (5h) 🛡️', action: 'Locked Focus Slot', highlight: true }
                        ].map((event, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col p-2 rounded border ${
                              event.highlight
                                ? 'bg-primary/10 border-primary/40 text-primary'
                                : `bg-zinc-950/20 ${event.color}`
                            }`}
                          >
                            <div className="flex justify-between items-center font-semibold text-[10px]">
                              <span className="font-mono">{event.time}</span>
                              <span className={event.highlight ? 'text-accent' : 'text-zinc-650 font-bold'}>{event.action}</span>
                            </div>
                            <span className="truncate font-bold text-[11px] mt-0.5">{event.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-zinc-400 text-center font-bold uppercase pt-1">
                        Protected Focus Time: <span className="text-accent">5.0h</span>
                      </div>
                    </div>

                  </div>
                )}

                {!isRescuing && (
                  <div className="bg-zinc-900/40 border border-zinc-850 p-3 rounded-lg flex items-start gap-2.5">
                    <Info size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Sentri AI calendar integrations will issue auto-declines with custom summary notes to meeting coordinators. It locks down a 5-hour Focus slot on Google Calendar to lower your delivery risk score.
                    </p>
                  </div>
                )}

                {!isRescuing && (
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setActiveRescueTask(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 text-xs font-bold transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => runCalendarRescue(activeRescueTask)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-indigo-500 text-xs font-bold text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/25"
                    >
                      <Zap size={13} /> Apply Calendar Rescue
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
