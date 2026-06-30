import { motion } from 'framer-motion'

const STACK = [
  { name: 'Gemini 2.0 Flash',     desc: 'Core intelligence engine',        icon: '✦', color: '#6366f1' },
  { name: 'Function Calling',      desc: 'Autonomous action execution',      icon: '⚡', color: '#a78bfa' },
  { name: 'Firebase Auth',         desc: 'Secure user authentication',       icon: '🔐', color: '#ef4444' },
  { name: 'Cloud Firestore',       desc: 'Real-time data layer',             icon: '🗄',  color: '#f59e0b' },
  { name: 'Cloud Functions',       desc: 'Serverless AI backend',            icon: '☁️', color: '#22c55e' },
  { name: 'Google Calendar API',   desc: 'Deep schedule integration',        icon: '📅', color: '#4285f4' },
  { name: 'Next.js 14',            desc: 'Lightning-fast web framework',     icon: '▲',  color: '#ffffff' },
  { name: 'Framer Motion',         desc: 'Fluid animation system',           icon: '🎭', color: '#ec4899' },
  { name: 'Tailwind CSS',          desc: 'Utility-first styling',            icon: '🎨', color: '#06b6d4' },
]

export default function Technology() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Technology</div>
        <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          Built on the<br />
          <span className="gradient-text">best in the world.</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">
          World-class infrastructure so you can trust Sentri with your most important work.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STACK.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group flex items-center gap-4 p-5 rounded-2xl cursor-default transition-all duration-300"
            style={{
              background: 'rgba(24,24,27,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-200 group-hover:scale-110"
              style={{ background: `${tech.color}15`, border: `1px solid ${tech.color}25` }}
            >
              {tech.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100">{tech.name}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{tech.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
