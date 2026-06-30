import { motion } from 'framer-motion'

const STEPS = [
  { icon: '📝', name: 'Task Created',          detail: 'Sentri reads title, description, tags, and context',                color: '#6366f1' },
  { icon: '📖', name: 'Reading Description',   detail: 'NLP extracts scope, complexity, and hidden dependencies',           color: '#8b5cf6' },
  { icon: '📅', name: 'Checking Calendar',     detail: 'Scans available hours, upcoming blocks, existing conflicts',         color: '#a78bfa' },
  { icon: '⏱',  name: 'Estimating Hours',      detail: 'Calibrated to your past velocity and task similarity',               color: '#f59e0b' },
  { icon: '⚠️', name: 'Predicting Risk',        detail: 'Calculating miss probability from 14 behavioral signals',            color: '#ef4444' },
  { icon: '🛟', name: 'Rescue Plan Generated',  detail: 'Execution steps, focus blocks, ghost draft — before you ask',       color: '#22c55e' },
]

export default function AIThinking() {
  return (
    <section id="ai-thinking" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">AI Workflow</div>
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
            Thinking so<br />
            you <span className="gradient-text">don't have to.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-md leading-relaxed mb-8">
            The moment you create a task, Sentri's AI begins a deep analysis invisible to every other tool.
          </p>

          {/* Stats row */}
          <div className="flex gap-6">
            {[['14', 'Behavioral\nsignals'], ['500ms', 'Prediction\ntime'], ['91%', 'Accuracy\nrate']].map(([val, label]) => (
              <div key={val} className="text-center">
                <div className="text-2xl font-black text-white mb-1">{val}</div>
                <div className="text-xs text-zinc-600 whitespace-pre-line font-medium">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="flex flex-col relative">
          {STEPS.map((step, i) => (
            <div key={step.name} className="flex gap-5 relative">
              <div className="flex flex-col items-center w-10 flex-shrink-0">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base z-10 relative flex-shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-default"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
                  whileHover={{ boxShadow: `0 0 20px ${step.color}40` }}
                >
                  {step.icon}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 + 0.2 }}
                    className="w-px flex-1 min-h-6 origin-top my-1"
                    style={{ background: `linear-gradient(180deg, ${step.color}50, ${STEPS[i+1].color}20)` }}
                  />
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 + 0.05 }}
                className="pb-7 pt-1.5"
              >
                <div className="text-sm font-bold mb-0.5 text-zinc-100">{step.name}</div>
                <div className="text-xs text-zinc-600 leading-relaxed">{step.detail}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
