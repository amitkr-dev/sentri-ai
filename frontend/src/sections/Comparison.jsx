import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const ROWS = [
  { feature: 'Deadline prediction',        other: false, sentri: true  },
  { feature: 'AI recovery plans',          other: false, sentri: true  },
  { feature: 'Autonomous scheduling',      other: false, sentri: true  },
  { feature: 'Learns your habits',         other: false, sentri: true  },
  { feature: 'Acts before problems',       other: false, sentri: true  },
  { feature: 'Morning AI brief',           other: false, sentri: true  },
  { feature: 'Ghost draft writing',        other: false, sentri: true  },
  { feature: 'Task lists',                 other: true,  sentri: true  },
  { feature: 'Reminders',                  other: true,  sentri: true  },
]

export default function Comparison() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Comparison</div>
        <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05]">
          Passive tools vs.<br />
          <span className="gradient-text">proactive AI.</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="grid grid-cols-3 text-center"
          style={{ background: 'rgba(24,24,27,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="py-4 px-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-widest">Feature</div>
          <div className="py-4 px-4 border-l" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="text-sm font-bold text-zinc-500">Traditional Apps</div>
            <div className="text-xs text-zinc-700 mt-0.5">Passive, reactive</div>
          </div>
          <div className="py-4 px-4 border-l relative" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
            <div className="text-sm font-bold text-primary">Sentri</div>
            <div className="text-xs text-indigo-500 mt-0.5">AI-powered, proactive</div>
          </div>
        </div>

        {/* Rows */}
        {ROWS.map((row, i) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-3 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.05)',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
            }}
          >
            <div className="py-3.5 px-4 text-sm text-zinc-400 font-medium">{row.feature}</div>
            <div className="py-3.5 px-4 flex justify-center border-l" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {row.other
                ? <Check size={16} className="text-zinc-500" />
                : <X size={16} className="text-zinc-800" />
              }
            </div>
            <div className="py-3.5 px-4 flex justify-center border-l" style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.03)' }}>
              {row.sentri
                ? <Check size={16} className="text-accent" style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' }} />
                : <X size={16} className="text-zinc-800" />
              }
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
