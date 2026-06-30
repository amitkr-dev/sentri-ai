import { motion } from 'framer-motion'

const PLAN = [
  { time: '9:00 AM',  icon: '📝', title: 'Ghost draft generated',    sub: 'AI wrote the intro and structure. Edit or accept.', color: '#6366f1' },
  { time: '10:00 AM', icon: '🗓', title: 'Calendar cleared',          sub: '3 low-priority meetings moved. 4-hour deep work block created.', color: '#a78bfa' },
  { time: '2:00 PM',  icon: '🔗', title: 'Dependencies resolved',     sub: '2 teammates auto-pinged with full context.', color: '#f59e0b' },
  { time: '6:00 PM',  icon: '✅', title: 'Submission ready',           sub: 'On time. 5 hours to spare.', color: '#22c55e' },
]

export default function RescueMode() {
  return (
    <section id="rescue" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Rescue Mode</div>
        <h2 className="text-[clamp(36px,5vw,60px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          From crisis to<br />
          <span className="gradient-text">controlled.</span>
        </h2>
        <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
          One click activates Rescue Mode. Sentri slashes risk, writes the plan, and starts the work.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Risk transformation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-8 text-center"
          style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-6">Risk transformation</p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-6xl font-black text-danger leading-none tracking-[-3px]">91%</div>
              <div className="text-xs text-zinc-600 mt-1 font-semibold">BEFORE</div>
            </div>
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl font-black text-primary"
            >→</motion.div>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-6xl font-black text-accent leading-none tracking-[-3px]"
              >12%</motion.div>
              <div className="text-xs text-zinc-600 mt-1 font-semibold">AFTER</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl mb-4"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="text-xl">⚡</span>
            <div className="text-left">
              <p className="text-xs font-bold text-accent">Rescue Mode Active</p>
              <p className="text-xs text-zinc-600">AI took 4 actions in 90 seconds</p>
            </div>
          </div>

          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              initial={{ width: '91%' }}
              whileInView={{ width: '12%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full transition-all"
              style={{ background: 'linear-gradient(90deg, #22c55e, #10b981)' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-red-500 font-bold">91% risk</span>
            <span className="text-xs text-accent font-bold">12% risk</span>
          </div>
        </motion.div>

        {/* Execution plan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-6"
          style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-5">Execution plan</p>

          <div className="space-y-1">
            {PLAN.map((step, i) => (
              <div key={step.title} className="flex gap-4 relative">
                <div className="flex flex-col items-center w-10 flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.12 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 z-10"
                    style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
                  >{step.icon}</motion.div>
                  {i < PLAN.length - 1 && (
                    <div className="w-px flex-1 min-h-4 my-1" style={{ background: `linear-gradient(180deg, ${step.color}40, transparent)` }} />
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 + 0.05 }}
                  className="pb-5"
                >
                  <div className="text-xs font-bold mb-0.5" style={{ color: step.color }}>{step.time}</div>
                  <div className="text-sm font-bold text-zinc-100 mb-0.5">{step.title}</div>
                  <div className="text-xs text-zinc-600 leading-relaxed">{step.sub}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
