import { motion } from 'framer-motion'
import { Github, ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: '#09090b', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        {/* BG gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(99,102,241,0.14) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 80%, rgba(167,139,250,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 20% 20%, rgba(34,197,94,0.05) 0%, transparent 60%)',
        }} />

        {/* Animated blobs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 px-8 md:px-16 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-indigo-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-8"
          >
            ✦ Built for Vibe2Ship 2026
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(40px,6vw,72px)] font-black tracking-[-3px] leading-[1.0] mb-6"
          >
            Ready to stop<br />
            <span className="gradient-text">missing deadlines?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="text-lg text-zinc-400 mb-10 max-w-md mx-auto"
          >
            Let Sentri become your AI Executive Assistant. Predict. Rescue. Finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a href="/app/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl text-base hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 animate-glow-pulse text-center">
              Launch App <ArrowRight size={16} />
            </a>
            <button className="flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5">
              <Github size={16} /> View on GitHub
            </button>
          </motion.div>

          <p className="mt-6 text-xs text-zinc-700">No credit card required · Built at hackathon speed</p>
        </div>
      </motion.div>
    </section>
  )
}
