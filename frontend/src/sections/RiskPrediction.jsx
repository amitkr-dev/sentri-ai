import { motion } from 'framer-motion'

const REASONS = [
  { icon: '⏰', text: 'Needs 14 hours — only 7 available',                pct: 85 },
  { icon: '📅', text: 'Deadline is tomorrow at 11:59 PM',                  pct: 90 },
  { icon: '📊', text: 'Similar tasks took you 2× longer than estimated',   pct: 70 },
  { icon: '🤝', text: '3 dependencies not yet resolved',                   pct: 60 },
  { icon: '😴', text: 'No focused work block scheduled today',              pct: 75 },
]

export default function RiskPrediction() {
  return (
    <section id="risk" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Risk Engine</div>
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
            91% miss chance.<br />
            <span className="text-danger">We caught it.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Sentri assigns a real-time risk score to every task and explains exactly why your deadline is in danger — days before it's too late.
          </p>

          <div className="space-y-2.5">
            {REASONS.map((r, i) => (
              <motion.div
                key={r.text}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.14)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base">{r.icon}</span>
                  <span className="text-sm font-medium text-zinc-300 flex-1">{r.text}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Risk ring card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-8 text-center"
          style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(239,68,68,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <div className="text-sm text-zinc-500 font-medium mb-1">Current task</div>
          <div className="text-xl font-bold mb-8">🏆 Hackathon Submission</div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="w-44 h-44 rounded-full flex items-center justify-center glow-danger"
                style={{ background: 'conic-gradient(#ef4444 0% 91%, rgba(30,30,36,1) 91% 100%)' }}
              >
                <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
                  style={{ background: '#18181b' }}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-4xl font-black text-danger tracking-tighter leading-none">91%</motion.span>
                  <span className="text-xs text-zinc-500 font-bold mt-1">MISS RISK</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-sm text-zinc-600 mb-4">Signals detected</div>
          <div className="grid grid-cols-3 gap-2">
            {[['Calendar', 'Dense'], ['Time Left', '7h'], ['Blockers', '3']].map(([k, v]) => (
              <div key={k} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <div className="text-xs text-zinc-600 mb-0.5">{k}</div>
                <div className="text-sm font-bold text-red-400">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
