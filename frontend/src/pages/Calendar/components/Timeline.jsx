import { motion } from 'framer-motion'
import { CalendarOff } from 'lucide-react'
import EventBlock from './EventBlock'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6am - 11pm
const HOUR_HEIGHT = 64

function formatHourLabel(h) {
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display} ${period}`
}

function TimelineSkeleton() {
  return (
    <div className="px-6 md:px-10 py-6">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-card2 animate-pulse"
            style={{ marginLeft: `${68 + i * 20}px`, opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-12 h-12 rounded-full bg-card2 border border-white/8 flex items-center justify-center mb-4">
        <CalendarOff size={20} className="text-zinc-600" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">Nothing scheduled</h3>
      <p className="text-xs text-zinc-500 max-w-[240px]">
        No events or AI focus blocks for this day yet.
      </p>
    </div>
  )
}

function TimelineError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mb-4">
        <CalendarOff size={20} className="text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">Couldn't load your schedule</h3>
      <p className="text-xs text-zinc-500 max-w-[240px] mb-4">
        Sentri couldn't reach Google Calendar. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="text-xs font-semibold bg-card2 border border-white/10 hover:border-white/20 text-zinc-300 px-4 py-2 rounded-lg transition-colors duration-200"
      >
        Retry
      </button>
    </div>
  )
}

export default function Timeline({ events, status, onRetry, onSelectEvent }) {
  if (status === 'loading') return <TimelineSkeleton />
  if (status === 'error') return <TimelineError onRetry={onRetry} />
  if (status === 'success' && events.length === 0) return <TimelineEmpty />

  return (
    <div className="px-6 md:px-10 py-6 overflow-x-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative min-w-[480px]"
        style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
      >
        {/* Hour grid lines + labels */}
        {HOURS.map((h, i) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{ top: `${i * HOUR_HEIGHT}px` }}
          >
            <span className="absolute -top-2 left-0 text-[10px] text-zinc-600 font-medium w-14">
              {formatHourLabel(h)}
            </span>
          </div>
        ))}

        {/* Current time indicator */}
        <CurrentTimeLine />

        {/* Events */}
        {events.map((event, i) => (
          <EventBlock key={event.id} event={event} index={i} onSelect={onSelectEvent} />
        ))}
      </motion.div>
    </div>
  )
}

function CurrentTimeLine() {
  const now = new Date()
  const decimalHour = now.getHours() + now.getMinutes() / 60
  if (decimalHour < 6 || decimalHour > 23) return null
  const top = (decimalHour - 6) * HOUR_HEIGHT

  return (
    <div
      className="absolute left-[60px] right-3 md:right-[220px] flex items-center gap-1.5 z-10"
      style={{ top: `${top}px` }}
      aria-hidden="true"
    >
      <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0 shadow-[0_0_6px_#ef4444]" />
      <div className="flex-1 h-px bg-danger/60" />
    </div>
  )
}
