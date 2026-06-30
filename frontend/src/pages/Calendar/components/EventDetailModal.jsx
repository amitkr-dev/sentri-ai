import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Sparkles, LifeBuoy } from 'lucide-react'
import { EVENT_SOURCE } from '../../../data/mockCalendarEvents'

const ICONS = {
  [EVENT_SOURCE.CALENDAR]: Calendar,
  [EVENT_SOURCE.AI_FOCUS]: Sparkles,
  [EVENT_SOURCE.RESCUE]: LifeBuoy,
}

export default function EventDetailModal({ event, onClose, onDelete }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            className="w-full max-w-sm bg-card border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = ICONS[event.source]
                  return <Icon size={16} className="text-primary" aria-hidden="true" />
                })()}
                <span id="event-modal-title" className="text-sm font-semibold text-white">
                  {event.title}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-zinc-500 hover:text-white transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {event.reason && (
              <div className="bg-card2 border border-white/5 rounded-lg p-3 mb-4">
                <p className="text-[11px] text-zinc-500 mb-1 font-semibold uppercase tracking-wide">
                  Why Sentri scheduled this
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">{event.reason}</p>
              </div>
            )}

            {event.googleEventId && (
              <p className="text-[11px] text-zinc-600 mb-4">
                Synced from Google Calendar · {event.googleEventId}
              </p>
            )}

            <div className="flex gap-2">
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(event.id || event.googleEventId)
                    onClose()
                  }}
                  className="w-1/2 text-xs font-semibold bg-red-950/20 border border-red-900/30 hover:border-red-900/50 text-red-400 py-2.5 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className={`text-xs font-semibold bg-primary hover:bg-indigo-500 text-white py-2.5 rounded-lg transition-colors duration-200 ${onDelete ? 'w-1/2' : 'w-full'}`}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
