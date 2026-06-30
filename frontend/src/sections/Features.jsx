import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: '🧠',
    name: 'AI Deadline Risk Prediction',
    tag: 'Core Engine',
    desc: 'Sentri analyzes 14 behavioral signals — calendar density, past velocity, task complexity, and blockers — calculating a real-time miss probability the moment you create a task.',
    wide: true,
    accent: '#6366f1',
  },
  {
    icon: '👻',
    name: 'Ghost Draft',
    tag: 'AI Writing',
    desc: 'When risk is high, Sentri writes a starter draft before you open the task. Edit, accept, or ignore.',
    accent: '#a78bfa',
  },
  {
    icon: '📅',
    name: 'Autonomous Scheduling',
    tag: 'Automation',
    desc: 'Low-priority meetings get cleared. Deep work blocks get created. Your calendar restructures itself.',
    accent: '#22c55e',
  },
  {
    icon: '🔗',
    name: 'Calendar Sync',
    tag: 'Integrations',
    desc: 'Native sync with Google Calendar. Sentri sees real availability and plans around it, not just working hours.',
    accent: '#4285f4',
  },
  {
    icon: '☀️',
    name: 'AI Morning Brief',
    tag: 'Insights',
    desc: 'Every morning: your riskiest tasks, what to tackle first, and what the AI handled overnight.',
    accent: '#f59e0b',
  },
  {
    icon: '🗺',
    name: 'Execution Planner',
    tag: 'Planning',
    desc: 'Any task broken into concrete steps with time estimates, assigned across your available hours, tracked live.',
    accent: '#ef4444',
  },
]

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-14"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Features</div>
        <h2 className="text-[clamp(36px,5vw,60px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          Everything you need<br />
          to <span className="gradient-text">finish.</span>
        </h2>
        <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
          A complete AI-powered suite that doesn't just organize — it executes before you're in trouble.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative rounded-2xl p-7 overflow-hidden cursor-default transition-all duration-300 group ${f.wide ? 'md:col-span-2' : ''}`}
            style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />

            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 60% 60% at 20% 20%, ${f.accent}10, transparent)` }}
            />

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}
            >
              {f.icon}
            </div>

            <div className="text-base font-bold mb-2 text-zinc-100">{f.name}</div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5">{f.desc}</p>

            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: `${f.accent}15`, color: f.accent, border: `1px solid ${f.accent}25` }}
            >
              {f.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
