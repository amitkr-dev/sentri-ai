import { motion } from 'framer-motion'

export default function ComingSoon({ title, subtitle, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-32"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
        {icon || '🚧'}
      </div>
      <h2 className="text-xl font-bold text-zinc-200 mb-2">{title}</h2>
      <p className="text-sm text-zinc-500 max-w-sm">{subtitle}</p>
    </motion.div>
  )
}
