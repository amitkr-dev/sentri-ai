import { motion } from 'framer-motion'

const BEFORE = [
  { step: '01', icon: '📋', title: 'Task Created',     sub: 'Added to your list, forgotten immediately.',   bad: false },
  { step: '02', icon: '🔔', title: 'Reminder Sent',    sub: 'At 9am, 5pm, the night before…',              bad: false },
  { step: '03', icon: '🙈', title: 'Reminder Ignored', sub: "You're busy. It can wait. (It can't.)",         bad: true  },
  { step: '04', icon: '💥', title: 'Deadline Missed',  sub: 'Panic. Regret. Repeat.',                        bad: true  },
]

const AFTER = [
  { step: '01', icon: '📋', title: 'Task Created',              sub: 'Sentri begins silent AI analysis.',           good: false },
  { step: '02', icon: '🧠', title: 'Gemini Predicts Risk',      sub: '91% miss probability detected 4 days out.',   good: false },
  { step: '03', icon: '🗓', title: 'Calendar Restructured',     sub: 'Low-priority events cleared. Focus block set.', good: true  },
  { step: '04', icon: '🛟', title: 'Recovery Plan Generated',   sub: 'Step-by-step execution, draft written.',       good: true  },
  { step: '05', icon: '✅', title: 'Deadline Saved',            sub: 'On time. Every time.',                         good: true  },
]

function Column({ title, items, accent, label }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className={`text-xs font-bold uppercase tracking-widest ${accent}`}>{label}</span>
        <div className="h-px flex-1" style={{ background: accent === 'text-zinc-500' ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.3)' }} />
      </div>
      <h3 className="text-xl font-black mb-8 text-zinc-300">{title}</h3>

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: label === '✕ Without Sentri' ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="flex gap-3 p-4 rounded-2xl transition-all duration-300 group cursor-default"
            style={{
              background: item.bad ? 'rgba(239,68,68,0.05)' : item.good ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.bad ? 'rgba(239,68,68,0.15)' : item.good ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: item.bad ? 'rgba(239,68,68,0.12)' : item.good ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)' }}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-zinc-700">{item.step}</span>
                <span className={`text-sm font-bold ${item.bad ? 'text-red-400' : item.good ? 'text-indigo-300' : 'text-zinc-300'}`}>{item.title}</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{item.sub}</p>
            </div>
            {item.bad && <span className="ml-auto text-red-500 flex-shrink-0 text-sm font-bold">✗</span>}
            {item.good && <span className="ml-auto text-accent flex-shrink-0 text-sm font-bold">✓</span>}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Problem() {
  return (
    <section id="problem" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">The Problem</div>
        <h2 className="text-[clamp(36px,5vw,60px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          Traditional apps react.<br />
          <span className="text-zinc-500 font-normal">Sentri predicts.</span>
        </h2>
        <p className="text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Reminders don't prevent missed deadlines. They just remind you that you missed them.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        <Column
          title="Every other productivity app"
          items={BEFORE}
          accent="text-zinc-500"
          label="✕ Without Sentri"
        />

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black my-4"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366f1' }}>VS</div>
          <div className="w-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <Column
          title="Sentri — AI that acts early"
          items={AFTER}
          accent="text-primary"
          label="✓ With Sentri"
        />
      </div>
    </section>
  )
}
