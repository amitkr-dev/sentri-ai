import { motion } from 'framer-motion'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,139,250,0.10) 50%, rgba(34,197,94,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 0 40px rgba(99,102,241,0.10)',
      }}
    >
      {/* Animated bg blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.6) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            ✦ AI Active
          </span>
        </div>
        <h2 className="text-2xl font-black mt-2 tracking-tight">
          {getGreeting()}, Amit 👋
        </h2>
        <p className="text-zinc-400 text-sm mt-1.5">
          <span className="text-red-400 font-semibold">1 task</span> is critical and needs your approval —
          Sentri already handled <span className="text-accent font-semibold">2 others</span> overnight.
        </p>
      </div>
    </motion.div>
  )
}
