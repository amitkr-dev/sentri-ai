import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Check, Undo2 } from 'lucide-react'

export default function RestructureBanner({ diff, onApprove, onUndo }) {
  const [expanded, setExpanded] = useState(false)
  const [resolved, setResolved] = useState(null) // null | 'approved' | 'undone'

  if (resolved) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mx-6 md:mx-10 mt-4 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs text-emerald-300 flex items-center gap-2"
      >
        <Check size={14} aria-hidden="true" />
        {resolved === 'approved' ? 'Schedule updated' : 'Restructure undone'}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mx-6 md:mx-10 mt-4 rounded-xl border border-primary/30 bg-primary/8 overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-primary" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-indigo-200">Sentri restructured your day</p>
          <p className="text-[11px] text-zinc-500 truncate">{diff.triggeredBy}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-primary/15">
              <p className="text-xs text-zinc-400 mb-3 mt-3">{diff.summary}</p>
              <div className="flex flex-col gap-2 mb-4">
                {diff.changes.map((c, i) => (
                  <div key={i} className="bg-card2 border border-white/5 rounded-lg px-3 py-2.5">
                    <div className="text-xs font-medium text-zinc-200 mb-1">{c.task}</div>
                    <div className="flex items-center gap-1.5 text-[11px] mb-1">
                      <span className="text-zinc-500 line-through">{c.from}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-primary font-semibold">{c.to}</span>
                    </div>
                    <div className="text-[11px] text-zinc-600">{c.reason}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setResolved('approved'); onApprove?.() }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <Check size={13} aria-hidden="true" /> Keep changes
                </button>
                <button
                  onClick={() => { setResolved('undone'); onUndo?.() }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-card2 hover:bg-white/5 border border-white/10 text-zinc-300 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <Undo2 size={13} aria-hidden="true" /> Undo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
