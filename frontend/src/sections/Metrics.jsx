import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCounter } from '../hooks/useCounter'

const METRICS = [
  { target: 10,  suffix: 'M+', label: 'Tasks analyzed',             sub: 'and counting'             },
  { target: 500, suffix: 'ms', label: 'Avg prediction time',        sub: 'faster than you can blink' },
  { target: 99,  suffix: '%',  label: 'On-time delivery rate',      sub: 'with Rescue Mode'          },
  { target: 65,  suffix: '%',  label: 'Reduction in deadline stress', sub: 'reported by users'       },
]

function MetricCard({ target, suffix, label, sub, active, delay }) {
  const value = useCounter(target, 2000, active)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl p-7 text-center cursor-default transition-all duration-300 group"
      style={{ background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="text-5xl font-black tracking-[-3px] mb-1 group-hover:scale-105 transition-transform duration-200" style={{
        background: 'linear-gradient(135deg, #e4e4e7 0%, #71717a 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value}{suffix}
      </div>
      <div className="text-sm font-semibold text-zinc-300 mb-1">{label}</div>
      <div className="text-xs text-zinc-600">{sub}</div>
    </motion.div>
  )
}

export default function Metrics() {
  const [ref, active] = useScrollReveal(0.4)
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">By the numbers</div>
        <h2 className="text-[clamp(36px,5vw,60px)] font-black tracking-[-2px] leading-[1.05]">
          Results that<br /><span className="gradient-text">speak for themselves.</span>
        </h2>
      </motion.div>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((m, i) => <MetricCard key={m.label} {...m} active={active} delay={i * 0.1} />)}
      </div>
    </section>
  )
}
