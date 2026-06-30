import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '../../store/taskStore'
import {
  Zap,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle,
  TrendingDown,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react'

const CURRENT_CALENDAR = [
  { time: '09:00 AM', label: 'Standup Sync (1h)', type: 'meeting' },
  { time: '10:30 AM', label: 'Product Alignment (30m)', type: 'meeting' },
  { time: '01:00 PM', label: 'Design Critique (1h)', type: 'meeting' },
  { time: '03:00 PM', label: 'Code Review (1h)', type: 'meeting' }
]

const MODES = [
  {
    id: 'conservative',
    title: 'Conservative',
    description: 'Declines only low-priority syncs. Reserves a 2-hour focus slot.',
    reclaimed: '2.0 hrs',
    riskChange: '62% → 45%',
    declinedCount: 1,
    accent: '#6366f1',
    bgGlow: 'rgba(99, 102, 241, 0.05)',
    proposedCalendar: [
      { time: '09:00 AM', label: 'Standup Sync (1h)', action: 'Keep', type: 'keep' },
      { time: '10:30 AM', label: 'Product Alignment (30m)', action: 'Decline', type: 'decline' },
      { time: '11:00 AM', label: 'Deep Focus Block (2h) 🛡️', action: 'Focus Block Locked', type: 'focus', duration: '2h' },
      { time: '01:00 PM', label: 'Design Critique (1h)', action: 'Keep', type: 'keep' },
      { time: '03:00 PM', label: 'Code Review (1h)', action: 'Keep', type: 'keep' }
    ]
  },
  {
    id: 'standard',
    title: 'Standard (Rec.)',
    description: 'Declines internal syncs, reschedules 1-on-1s. Reserves a 4-hour focus slot.',
    reclaimed: '4.0 hrs',
    riskChange: '62% → 28%',
    declinedCount: 2,
    accent: '#8b5cf6',
    bgGlow: 'rgba(139, 92, 246, 0.05)',
    proposedCalendar: [
      { time: '09:00 AM', label: 'Standup Sync (1h)', action: 'Decline', type: 'decline' },
      { time: '10:30 AM', label: 'Product Alignment (30m)', action: 'Decline', type: 'decline' },
      { time: '11:00 AM', label: 'Deep Focus Block (4h) 🛡️', action: 'Focus Block Locked', type: 'focus', duration: '4h' },
      { time: '01:00 PM', label: 'Design Critique (1h)', action: 'Keep', type: 'keep' },
      { time: '03:00 PM', label: 'Code Review (1h)', action: 'Keep', type: 'keep' }
    ]
  },
  {
    id: 'crisis',
    title: 'Crisis Mode',
    description: 'Declines all internal syncs, auto-updates Slack status. Reserves a 6.5-hour focus slot.',
    reclaimed: '6.5 hrs',
    riskChange: '62% → 12%',
    declinedCount: 4,
    accent: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.05)',
    proposedCalendar: [
      { time: '09:00 AM', label: 'Standup Sync (1h)', action: 'Decline', type: 'decline' },
      { time: '10:30 AM', label: 'Product Alignment (30m)', action: 'Decline', type: 'decline' },
      { time: '11:00 AM', label: 'Deep Focus Block (6.5h) 🛡️', action: 'Focus Block Locked', type: 'focus', duration: '6.5h' },
      { time: '01:00 PM', label: 'Design Critique (1h)', action: 'Decline', type: 'decline' },
      { time: '03:00 PM', label: 'Code Review (1h)', action: 'Decline', type: 'decline' }
    ]
  }
]

export default function Rescue() {
  const { tasks, activateRescue, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const portfolioRisk = activeTasks.length 
    ? Math.round(activeTasks.reduce((sum, t) => sum + t.risk, 0) / activeTasks.length)
    : 0

  const [selectedModeId, setSelectedModeId] = useState('standard')
  const [notifySlack, setNotifySlack] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState(0)
  const [isDeployed, setIsDeployed] = useState(false)

  const activeMode = MODES.find(m => m.id === selectedModeId) || MODES[1]

  const highRiskTaskWithPlan = useMemo(() => {
    return tasks.find(t => t.risk >= 70 && t.executionPlanData && t.status !== 'done')
  }, [tasks])

  const proposedCalendarToRender = useMemo(() => {
    if (highRiskTaskWithPlan && highRiskTaskWithPlan.executionPlanData) {
      const { executionPlan, focusBlocks } = highRiskTaskWithPlan.executionPlanData
      const list = []
      
      // Add focus blocks first
      if (focusBlocks && focusBlocks.length > 0) {
        focusBlocks.forEach(block => {
          list.push({
            time: `${block.start} - ${block.end}`,
            label: `Focus Block: ${highRiskTaskWithPlan.title} 🛡️`,
            action: 'Focus Block Locked',
            type: 'focus'
          })
        })
      }
      
      // Add execution plan phases
      if (executionPlan && executionPlan.length > 0) {
        executionPlan.forEach(phase => {
          list.push({
            time: phase.duration,
            label: phase.title,
            action: `Priority ${phase.priority}`,
            type: 'keep'
          })
        })
      }
      
      return list
    }
    return activeMode.proposedCalendar
  }, [highRiskTaskWithPlan, activeMode])

  const reclaimedHoursToRender = useMemo(() => {
    if (highRiskTaskWithPlan && highRiskTaskWithPlan.executionPlanData) {
      return `${highRiskTaskWithPlan.executionPlanData.estimatedHours || 8}.0 hrs`
    }
    return activeMode.reclaimed
  }, [highRiskTaskWithPlan, activeMode])

  const riskImpactToRender = useMemo(() => {
    if (highRiskTaskWithPlan && highRiskTaskWithPlan.executionPlanData) {
      const originalRisk = highRiskTaskWithPlan.risk
      const targetRisk = Math.round(originalRisk * 0.25)
      return `${originalRisk}% → ${targetRisk}%`
    }
    return activeMode.riskChange
  }, [highRiskTaskWithPlan, activeMode])

  const focusBlockTimeRange = useMemo(() => {
    if (highRiskTaskWithPlan && highRiskTaskWithPlan.executionPlanData) {
      const blocks = highRiskTaskWithPlan.executionPlanData.focusBlocks
      if (blocks && blocks.length > 0) {
        return `Protected Block locked (${blocks[0].start} - ${blocks[0].end})`
      }
    }
    return "Protected Block locked (11:00 AM - 4:00 PM)"
  }, [highRiskTaskWithPlan])

  const slackMessagePreview = useMemo(() => {
    if (highRiskTaskWithPlan && highRiskTaskWithPlan.ghostDraft) {
      const draft = highRiskTaskWithPlan.ghostDraft
      const draftTxt = draft.content || draft.message || ""
      return draftTxt.length > 120 ? `"${draftTxt.slice(0, 120)}..."` : `"${draftTxt}"`
    }
    return `"⚡ Amit is entering Focus Rescue Mode. Rescheduled ${activeMode.declinedCount} internal syncs to protect deep work block. Auto-decline active."`
  }, [highRiskTaskWithPlan, activeMode])

  const steps = [
    'Scanning calendar event severity...',
    'Resolving secondary meeting overlaps...',
    'Drafting custom sync decline summaries...',
    notifySlack ? 'Broadcasting focus status to Slack channel...' : 'Securing local calendar slots...',
    'Syncing Google Calendar focus locks...'
  ]

  // Run execution animation
  useEffect(() => {
    if (!isExecuting) return

    const interval = setInterval(() => {
      setExecutionStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExecuting(false)
            setIsDeployed(true)
          }, 600)
          return prev
        }
        return prev + 1
      })
    }, 700)

    return () => clearInterval(interval)
  }, [isExecuting, notifySlack])

  const handleTriggerRescue = async () => {
    setIsExecuting(true)
    setExecutionStep(0)
    
    const highRiskTasks = tasks.filter(t => t.risk >= 75 && t.status !== 'done')
    for (const t of highRiskTasks) {
      await activateRescue(t.id)
    }

    const { isCalendarConnected, saveCalendarEvent } = useTaskStore.getState()
    if (isCalendarConnected) {
      try {
        const { calendarService } = await import('../../services/calendar.service')
        for (const t of highRiskTasks) {
          console.log("[DEBUG] Creating focus block in Google Calendar for task:", t.title)
          const newEv = await calendarService.createFocusBlock(t, t.executionPlanData)
          await saveCalendarEvent(newEv)
        }
      } catch (e) {
        console.error("[RescueMode] Failed to add focus blocks to Google Calendar:", e)
      }
    }
  }

  const handleRevertRescue = async () => {
    const { isCalendarConnected, calendarEvents, deleteCalendarEvent } = useTaskStore.getState()
    if (isCalendarConnected) {
      try {
        const { calendarService } = await import('../../services/calendar.service')
        const eventsToDelete = calendarEvents.filter(e => e.title.includes('🔥 Deep Work -'))
        for (const ev of eventsToDelete) {
          console.log("[DEBUG] Deleting Google Calendar focus block:", ev.id)
          await calendarService.deleteFocusBlock(ev.id)
          await deleteCalendarEvent(ev.id)
        }
      } catch (e) {
        console.error("[RescueMode] Failed to revert Google Calendar focus blocks:", e)
      }
    }
    setIsDeployed(false)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Rescue Mode <span className="text-xs px-2.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/25 flex items-center gap-1"><Zap size={11} className="animate-pulse" /> Active Shield</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Defend your time. Trigger Sentri calendar autopilot to decline low-priority syncs and protect deep work.</p>
      </div>

      <AnimatePresence mode="wait">
        {!isDeployed ? (
          <motion.div
            key="config-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* 2. Configuration Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {MODES.map((mode) => {
                const isSelected = mode.id === selectedModeId
                return (
                  <div
                    key={mode.id}
                    onClick={() => !isExecuting && setSelectedModeId(mode.id)}
                    className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900/50 border-zinc-700'
                        : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-850 hover:bg-zinc-900/20'
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 25px ${mode.accent}12` : 'none'
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {mode.title}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                          style={{
                            borderColor: mode.accent + '35',
                            background: mode.accent + '15',
                            color: mode.accent
                          }}
                        >
                          +{mode.reclaimed}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-normal">{mode.description}</p>
                    </div>

                    <div className="mt-5 border-t border-zinc-800/50 pt-3 flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Predicted Risk Impact:</span>
                      <span className="font-bold flex items-center gap-1 text-accent">
                        <TrendingDown size={12} /> {isSelected && highRiskTaskWithPlan ? riskImpactToRender : mode.riskChange}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 3. Live Visualizer Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              
              {/* Before Calendar View */}
              <div className="lg:col-span-2 bg-card border border-zinc-800/80 rounded-2xl p-5" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Before (Current Calendar)</span>
                  <span className="text-xs font-black text-danger flex items-center gap-1">
                    <AlertTriangle size={11} /> {portfolioRisk}% Portfolio Risk
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {CURRENT_CALENDAR.map((event, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-3 rounded-xl bg-zinc-900/30 border border-zinc-850">
                      <span className="font-mono text-[10px] text-zinc-500 w-16">{event.time}</span>
                      <div className="w-0.5 h-6 bg-danger/55 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-zinc-300 truncate">{event.label}</h4>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-zinc-500 text-center font-bold uppercase mt-4">
                  Focus Block Hours Reclaimed: <span className="text-danger font-black">0.0h</span>
                </div>
              </div>

              {/* Transition Arrow Indicator (Desktop) */}
              <div className="hidden lg:flex items-center justify-center text-zinc-700">
                <div className="flex flex-col items-center gap-2">
                  <Zap size={22} className="text-primary/45" />
                  <ChevronRight size={24} />
                </div>
              </div>

              {/* After Calendar View */}
              <div className="lg:col-span-2 bg-card border border-zinc-800/80 rounded-2xl p-5" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">After Proposed Rescue</span>
                  <span className="text-xs font-black text-accent flex items-center gap-0.5">
                    <TrendingDown size={12} /> {highRiskTaskWithPlan ? Math.round(highRiskTaskWithPlan.risk * 0.25) : Math.round(selectedModeId === 'conservative' ? portfolioRisk * 0.75 : selectedModeId === 'standard' ? portfolioRisk * 0.45 : portfolioRisk * 0.20)}% Risk
                  </span>
                </div>

                <div className="space-y-2.5">
                  {proposedCalendarToRender.map((event, idx) => {
                    const isFocus = event.type === 'focus'
                    const isDecline = event.type === 'decline'

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 items-center p-3 rounded-xl border ${
                          isFocus
                            ? 'bg-primary/5 border-primary/25'
                            : isDecline
                            ? 'bg-zinc-950/20 border-zinc-900 text-zinc-650'
                            : 'bg-zinc-900/30 border-zinc-850'
                        }`}
                      >
                        <span className={`font-mono text-[10px] w-16 ${isDecline ? 'text-zinc-600' : 'text-zinc-500'}`}>
                          {event.time}
                        </span>
                        
                        <div
                          className={`w-0.5 h-6 rounded-full ${
                            isFocus ? 'bg-primary' : isDecline ? 'bg-zinc-800' : 'bg-accent'
                          }`}
                        />

                        <div className="min-w-0 flex-1 flex justify-between items-center">
                          <h4 className={`text-xs font-semibold truncate ${isDecline ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                            {event.label}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isFocus
                                ? 'bg-primary/20 text-primary'
                                : isDecline
                                ? 'bg-zinc-900 text-zinc-500'
                                : 'bg-accent/15 text-accent border border-accent/20'
                            }`}
                          >
                            {event.action}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="text-[10px] text-zinc-400 text-center font-bold uppercase mt-4">
                  Focus Block Hours Reclaimed: <span className="text-accent font-black">+{reclaimedHoursToRender}</span>
                </div>
              </div>

            </div>

            {/* 4. Slack Status Config & Execution Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              
              {/* Slack Card */}
              <div className="lg:col-span-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-sky-400" /> Slack Channel broadcast
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifySlack}
                        onChange={(e) => setNotifySlack(e.target.checked)}
                        disabled={isExecuting}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white" />
                    </label>
                  </div>
                  <p className="text-xs text-zinc-500">Post update to #development channel and update status to Do Not Disturb.</p>
                </div>

                <div className={`mt-4 p-4 rounded-xl border bg-zinc-900/30 ${notifySlack ? 'border-sky-500/20' : 'border-zinc-900 opacity-40'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-sky-500 text-[10px] text-white flex items-center justify-center font-bold">S</div>
                    <span className="text-[10px] font-bold text-zinc-400">Slack Integration</span>
                    <span className="text-[9px] text-zinc-600">· preview</span>
                  </div>
                  <p className="text-xs text-zinc-350 leading-relaxed font-mono">
                    {slackMessagePreview}
                  </p>
                </div>
              </div>

              {/* Execution Action Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={13} /> Automate Scheduling
                  </h3>
                  <p className="text-xs text-zinc-400 leading-normal mt-2">
                    Once clicked, Sentri runs background API requests to decline conflict blocks and lock down calendar coordinates.
                  </p>
                </div>

                <div className="mt-5 pt-3">
                  {isExecuting ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-primary font-mono animate-pulse">{steps[executionStep]}</span>
                        <span className="text-zinc-500">{Math.round(((executionStep + 1) / steps.length) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${((executionStep + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleTriggerRescue}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-indigo-500 active:scale-95 transition-all text-xs font-bold text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                      <Zap size={14} /> Trigger Calendar Rescue
                    </button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* 5. Success Summary screen after execution */
          <motion.div
            key="deployed-screen"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="max-w-2xl mx-auto bg-card border border-accent/25 rounded-2xl overflow-hidden shadow-2xl"
          >
            
            {/* Header glow banner */}
            <div className="bg-gradient-to-r from-accent/15 via-emerald-500/10 to-transparent border-b border-accent/20 px-6 py-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <CheckCircle size={22} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Rescue Mode Active</h2>
                <p className="text-xs text-zinc-400">Calendar autopilot has completed scheduling defenses successfully.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Reclaimed Time', value: reclaimedHoursToRender, text: 'text-accent' },
                  { label: 'Conflict Cleared', value: `${activeMode.declinedCount} Syncs`, text: 'text-white' },
                  { label: 'Portfolio Risk', value: highRiskTaskWithPlan ? `${Math.round(highRiskTaskWithPlan.risk * 0.25)}%` : `${Math.round(selectedModeId === 'conservative' ? portfolioRisk * 0.75 : selectedModeId === 'standard' ? portfolioRisk * 0.45 : portfolioRisk * 0.20)}%`, text: 'text-accent font-black' }
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">{stat.label}</span>
                    <h4 className={`text-xl font-bold mt-1.5 leading-none ${stat.text}`}>{stat.value}</h4>
                  </div>
                ))}
              </div>

              {/* Details of Actions Applied */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-accent" /> Active Time Defenses
                </h4>
                
                <div className="border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-hidden bg-zinc-950/20">
                  <div className="px-4 py-3 text-xs flex justify-between items-center text-zinc-400">
                    <span className="flex items-center gap-2">
                      <Calendar size={13} className="text-zinc-500" /> Google Calendar
                    </span>
                    <span className="font-semibold text-white">{focusBlockTimeRange}</span>
                  </div>

                  <div className="px-4 py-3 text-xs flex justify-between items-center text-zinc-400">
                    <span className="flex items-center gap-2">
                      <MessageSquare size={13} className="text-sky-400" /> Slack Focus Status
                    </span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <span>⚡ Sentri Focus Lock</span>
                      <span className="text-[10px] font-bold text-zinc-500 px-1 bg-zinc-900 border rounded">DND</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 text-xs flex justify-between items-center text-zinc-400">
                    <span className="flex items-center gap-2">
                      <Clock size={13} className="text-zinc-500" /> Auto-Decline
                    </span>
                    <span className="font-semibold text-zinc-500">Decline messages sent with project summaries</span>
                  </div>
                </div>
              </div>

              {/* Notice advice */}
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl flex items-start gap-3">
                <Info size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Teammates will see the calendar focus slots as DND. Sentri will monitor your task completion pace throughout the afternoon focus slot. Risk parameters will adjust periodically.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleRevertRescue}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-300 text-xs font-bold transition-all border border-zinc-850 active:scale-95"
                >
                  <RefreshCw size={12} /> Revert Calendar Changes
                </button>

                <button
                  onClick={handleRevertRescue}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-accent/25"
                >
                  Close & View Dashboard
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
