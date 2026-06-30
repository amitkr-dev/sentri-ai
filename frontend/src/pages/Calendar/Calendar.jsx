import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DaySwitcher from './components/DaySwitcher'
import Timeline from './components/Timeline'
import RestructureBanner from './components/RestructureBanner'
import RiskMiniSummary from './components/RiskMiniSummary'
import EventDetailModal from './components/EventDetailModal'
import { useTaskStore } from '../../store/taskStore'
import { Calendar as CalendarIcon, Plus, X, Sparkles } from 'lucide-react'

const TODAY_INDEX = new Date().getDay()

export default function Calendar() {
  const { 
    calendarEvents, 
    saveCalendarEvent, 
    deleteCalendarEvent, 
    fetchTasks,
    isCalendarConnected,
    isConnectingCalendar,
    connectGoogleCalendar,
    disconnectGoogleCalendar
  } = useTaskStore()
  const [selectedIndex, setSelectedIndex] = useState(TODAY_INDEX)
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | error
  const [showRestructure, setShowRestructure] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  // Add Event Form Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStart, setNewStart] = useState('9')
  const [newEnd, setNewEnd] = useState('11')
  const [newSource, setNewSource] = useState('ai_focus')

  const dateOffset = selectedIndex - TODAY_INDEX

  const loadEvents = async () => {
    setStatus('loading')
    try {
      await fetchTasks()
      if (dateOffset === 0) {
        setEvents(calendarEvents)
      } else if (dateOffset === 1) {
        // Mock tomorrow's events
        setEvents([
          { id: 'evt_tom_1', title: 'Product review sync', source: 'calendar', start: 10, end: 11.5, googleEventId: 'gcal_tom_1' }
        ])
      } else {
        setEvents([])
      }
      setStatus('success')
    } catch (e) {
      setStatus('error')
    }
  }

  useEffect(() => {
    loadEvents()
    
    // Listen to custom calendar updates
    window.addEventListener('calendarUpdated', loadEvents)
    return () => window.removeEventListener('calendarUpdated', loadEvents)
  }, [dateOffset, calendarEvents])

  const handleRetry = () => {
    loadEvents()
  }

  const handleConnectCalendar = async () => {
    try {
      await connectGoogleCalendar()
    } catch (e) {
      alert(`Google Calendar connection failed: ${e.message}`)
    }
  }

  const handleDisconnectCalendar = async () => {
    await disconnectGoogleCalendar()
  }

  const handleDeleteEvent = async (id) => {
    if (isCalendarConnected) {
      try {
        const { calendarService } = await import('../../services/calendar.service')
        await calendarService.deleteFocusBlock(id)
      } catch (e) {
        console.error("Failed to delete event from Google Calendar:", e)
      }
    }
    await deleteCalendarEvent(id)
    loadEvents()
    window.dispatchEvent(new Event('calendarUpdated'))
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    if (isCalendarConnected) {
      try {
        const { calendarService } = await import('../../services/calendar.service')
        const createdEv = await calendarService.createFocusBlock(
          { title: newTitle, description: 'Manually created focus block.' },
          null
        )
        // Adjust properties to match form selection
        createdEv.start = Number(newStart)
        createdEv.end = Number(newEnd)
        createdEv.source = newSource
        
        await saveCalendarEvent(createdEv)
      } catch (err) {
        console.error("Failed to save event to Google Calendar:", err)
      }
    } else {
      const newEv = {
        id: 'evt_' + Date.now(),
        title: newTitle,
        source: newSource,
        start: Number(newStart),
        end: Number(newEnd),
        reason: newSource !== 'calendar' ? 'Manually reserved by user' : undefined,
        googleEventId: newSource === 'calendar' ? 'gcal_' + Date.now() : undefined
      }
      await saveCalendarEvent(newEv)
    }

    loadEvents()
    window.dispatchEvent(new Event('calendarUpdated'))
    setIsAddModalOpen(false)
    setNewTitle('')
    setNewStart('9')
    setNewEnd('11')
    setNewSource('ai_focus')
  }

  const handleApproveRestructure = async () => {
    // Decline standard syncs and optimize calendar
    await deleteCalendarEvent('evt_1')
    const focusBlock = {
      id: 'evt_p1_focus',
      title: 'Deep Work: Webhook Migration',
      source: 'ai_focus',
      start: 9.5,
      end: 13,
      reason: 'Autopilot locked down focus block after day restructure approved.'
    }
    await saveCalendarEvent(focusBlock)
    loadEvents()
    window.dispatchEvent(new Event('calendarUpdated'))
    setShowRestructure(false)
  }

  const RESTRUCTURE_DIFF = {
    triggeredBy: 'Team standup sync overlaps Stripe API Webhook deadline',
    summary: 'Sentri optimized your schedule to protect focus code blocks.',
    changes: [
      { task: 'Team standup sync', from: '9:00 AM', to: 'Declined (Auto-summary)', reason: 'Cleared to make room for focus block' },
      { task: 'Deep Work: Webhook Migration', from: '1:00 PM', to: '9:30 AM', reason: 'Shifted up to block out the morning runway' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-card border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-primary" />
          <div>
            <h3 className="text-sm font-bold text-white">Focus Calendar</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {isCalendarConnected ? "Connected to Google Calendar" : "Synced with Google Calendar API"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isCalendarConnected ? (
            <button
              onClick={handleConnectCalendar}
              disabled={isConnectingCalendar}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 disabled:opacity-50 transition-all text-xs font-bold text-zinc-300 rounded-xl"
            >
              {isConnectingCalendar ? (
                <>
                  <div className="w-3 h-3 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Google Calendar"
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnectCalendar}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-950/20 border border-red-900/30 hover:border-red-900/50 active:scale-95 transition-all text-xs font-bold text-red-400 rounded-xl"
            >
              Disconnect
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-indigo-500 active:scale-95 transition-all text-xs font-bold text-white rounded-xl shadow-lg shadow-primary/25 border border-primary/20"
          >
            <Plus size={14} /> Schedule focus block
          </button>
        </div>
      </div>

      <DaySwitcher selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

      <AnimatePresence>
        {showRestructure && dateOffset === 0 && status === 'success' && events.some(e => e.id === 'evt_1') && (
          <RestructureBanner
            diff={RESTRUCTURE_DIFF}
            onApprove={handleApproveRestructure}
            onUndo={() => setShowRestructure(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <Timeline
          events={events}
          status={status}
          onRetry={handleRetry}
          onSelectEvent={setSelectedEvent}
        />
        {status === 'success' && events.length > 0 && <RiskMiniSummary />}
      </div>

      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onDelete={handleDeleteEvent} />

      {/* Add Focus Block Modal Dialog */}
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
                  <Sparkles size={14} className="text-primary" /> Add Focus Block / Event
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Focus work on webhook APIs"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Source/Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Block Type</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  >
                    <option value="ai_focus">AI Focus Block ( Indigo )</option>
                    <option value="rescue">Rescue Recovery Block ( Amber )</option>
                    <option value="calendar">Standard Meeting ( Grey )</option>
                  </select>
                </div>

                {/* Start & End Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Start Time (24h)</label>
                    <select
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 7).map(h => (
                        <React.Fragment key={h}>
                          <option value={h}>{h}:00</option>
                          <option value={h + 0.5}>{h}:30</option>
                        </React.Fragment>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">End Time (24h)</label>
                    <select
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                        <React.Fragment key={h}>
                          <option value={h}>{h}:00</option>
                          <option value={h + 0.5}>{h}:30</option>
                        </React.Fragment>
                      ))}
                    </select>
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
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Create Block
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
