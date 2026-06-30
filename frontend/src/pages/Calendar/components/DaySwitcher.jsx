import { motion } from 'framer-motion'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildWeek() {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return {
      date: d,
      label: DAY_LABELS[i],
      isToday: d.toDateString() === today.toDateString(),
    }
  })
}

export default function DaySwitcher({ selectedIndex, onSelect }) {
  const week = buildWeek()

  return (
    <div
      role="tablist"
      aria-label="Select day"
      className="flex gap-2 px-6 md:px-10 py-4 overflow-x-auto"
    >
      {week.map((day, i) => {
        const active = i === selectedIndex
        return (
          <button
            key={i}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(i)}
            className={`relative flex flex-col items-center justify-center min-w-[52px] h-16 rounded-xl border transition-all duration-200 flex-shrink-0
              ${active
                ? 'bg-primary border-primary text-white'
                : 'bg-card border-white/8 text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
          >
            {active && (
              <motion.div
                layoutId="day-active-bg"
                className="absolute inset-0 rounded-xl bg-primary -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {day.label}
            </span>
            <span className="text-base font-bold mt-0.5">{day.date.getDate()}</span>
            {day.isToday && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}
