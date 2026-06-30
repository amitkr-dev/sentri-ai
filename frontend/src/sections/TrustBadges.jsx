import { motion } from 'framer-motion'

const TECHS = [
  { name: 'Gemini',          icon: '✦', color: '#6366f1' },
  { name: 'Firebase',        icon: '🔥', color: '#f59e0b' },
  { name: 'Firestore',       icon: '🗄',  color: '#22c55e' },
  { name: 'Google Calendar', icon: '📅', color: '#4285f4' },
  { name: 'Cloud Functions', icon: '⚡', color: '#a78bfa' },
  { name: 'Google OAuth',    icon: '🔐', color: '#ef4444' },
  { name: 'Next.js',         icon: '▲',  color: '#ffffff' },
  { name: 'Tailwind CSS',    icon: '🎨', color: '#06b6d4' },
]

export default function TrustBadges() {
  return (
    <section className="py-16 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-bold uppercase tracking-widest text-zinc-700 mb-8"
        >
          Built on world-class infrastructure
        </motion.p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {TECHS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-default group transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">{t.icon}</span>
              <span className="text-xs text-zinc-600 font-medium text-center leading-tight group-hover:text-zinc-400 transition-colors">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
