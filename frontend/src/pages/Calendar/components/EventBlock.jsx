import { motion } from 'framer-motion'
import { Calendar, Sparkles, LifeBuoy } from 'lucide-react'
import { EVENT_SOURCE } from '../../../data/mockCalendarEvents'

const HOUR_HEIGHT = 64 // px per hour, must match Timeline.jsx

const SOURCE_CONFIG = {
  [EVENT_SOURCE.CALENDAR]: {
    icon: Calendar,
    label: 'Calendar',
    border: 'border-white/12',
    bg: 'bg-card2',
    text: 'text-zinc-300',
    iconColor: 'text-zinc-500',
  },
  [EVENT_SOURCE.AI_FOCUS]: {
    icon: Sparkles,
    label: 'AI focus block',
    border: 'border-primary/40',
    bg: 'bg-primary/10',
    text: 'text-indigo-200',
    iconColor: 'text-primary',
  },
  [EVENT_SOURCE.RESCUE]: {
    icon: LifeBuoy,
    label: 'Rescue plan',
    border: 'border-warning/40',
    bg: 'bg-warning/10',
    text: 'text-amber-200',
    iconColor: 'text-warning',
  },
}

export default function EventBlock({ event, index, onSelect }) {
  const config = SOURCE_CONFIG[event.source]
  const Icon = config.icon
  const top = event.start * HOUR_HEIGHT
  const height = Math.max((event.end - event.start) * HOUR_HEIGHT, 36)

  const formatTime = (h) => {
    const hour = Math.floor(h)
    const min = h % 1 === 0.5 ? '30' : '00'
    const period = hour >= 12 ? 'PM' : 'AM'
    const display = hour % 12 === 0 ? 12 : hour % 12
    return `${display}:${min} ${period}`
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onSelect?.(event)}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={`absolute left-[68px] right-3 md:right-[220px] rounded-lg border ${config.border} ${config.bg} px-3 py-2 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className={config.iconColor} aria-hidden="true" />
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${config.iconColor}`}>
          {config.label}
        </span>
      </div>
      <div className={`text-sm font-semibold truncate ${config.text}`}>{event.title}</div>
      <div className="text-[11px] text-zinc-500 mt-0.5">
        {formatTime(event.start)} – {formatTime(event.end)}
      </div>
    </motion.button>
  )
}
