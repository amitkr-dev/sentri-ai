import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features',    href: '#features' },
  { label: 'How it Works', href: '#how'    },
  { label: 'Risk Engine', href: '#risk'     },
  { label: 'Rescue Mode', href: '#rescue'   },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/75 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-primary/40" style={{ boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">Sentri<span className="text-primary">.</span></span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 list-none">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 relative group">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex gap-3 items-center">
          <a href="/app/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg transition-all duration-200">
            Try Sentri Demo
          </a>
          <a href="/app/dashboard" className="text-sm font-semibold bg-primary hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 inline-flex items-center gap-1.5">
            Launch App <span className="text-indigo-200">→</span>
          </a>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-bg/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-2 transition-colors">{l.label}</a>
              ))}
              <a href="/app/dashboard" className="block text-sm font-semibold bg-primary text-white px-4 py-2.5 rounded-lg text-center mt-3">Launch App →</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
