import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Create Your Goal',
    desc: 'Add a task with a deadline. Sentri reads the context, scope, and your calendar automatically.',
    icon: '🎯',
    color: '#6366f1',
  },
  {
    num: '02',
    title: 'Gemini Predicts Risk',
    desc: 'AI calculates a real-time miss probability, explains exactly why, and generates a rescue plan.',
    icon: '🧠',
    color: '#a78bfa',
  },
  {
    num: '03',
    title: 'Sentri Acts Early',
    desc: 'Calendar restructured, draft written, focus blocks scheduled — all before the deadline is in danger.',
    icon: '⚡',
    color: '#22c55e',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">How It Works</div>
        <h2 className="text-[clamp(36px,5vw,60px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          Three steps to<br />
          <span className="gradient-text">never being late.</span>
        </h2>
        <p className="text-lg text-zinc-500 max-w-md mx-auto leading-relaxed">
          Sentri works in the background. By the time you're worried, it's already handled.
        </p>
      </motion.div>

      <div className="relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px"
          style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa, #22c55e)' }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Circle */}
              <div className="flex justify-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl cursor-default"
                  style={{
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    boxShadow: `0 0 30px ${step.color}20`,
                  }}
                >
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: step.color, fontSize: '9px' }}>{step.num}</div>
                </motion.div>
              </div>

              <div className="px-4">
                <h3 className="text-lg font-black mb-3 text-zinc-100">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
