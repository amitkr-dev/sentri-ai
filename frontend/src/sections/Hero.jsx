import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 2.5 + 0.5
      Object.assign(p.style, {
        position:       'absolute',
        width:          `${size}px`,
        height:         `${size}px`,
        borderRadius:   '50%',
        background:     i % 3 === 0 ? 'rgba(99,102,241,0.7)' : i % 3 === 1 ? 'rgba(167,139,250,0.5)' : 'rgba(34,197,94,0.4)',
        left:           `${Math.random() * 100}%`,
        animation:      `drift ${Math.random() * 18 + 12}s linear infinite`,
        animationDelay: `${Math.random() * 12}s`,
        opacity:        `${Math.random() * 0.6 + 0.1}`,
        pointerEvents:  'none',
      })
      container.appendChild(p)
    }
    return () => { container.innerHTML = '' }
  }, [])
  return <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" />
}

function AIBrief() {
  const [riskFilled, setRiskFilled] = useState(false)
  const [actionsVisible, setActionsVisible] = useState(false)
  const [thinking, setThinking] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setThinking(false), 1400)
    const t2 = setTimeout(() => setRiskFilled(true), 1800)
    const t3 = setTimeout(() => setActionsVisible(true), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative animate-float"
    >
      {/* Outer glow */}
      <div className="absolute -inset-px rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.15), rgba(34,197,94,0.1))', filter: 'blur(1px)' }} />

      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'rgba(15,15,20,0.92)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
        {/* Header bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-zinc-600 ml-2 font-medium">Sentri · AI Command Center</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-xs text-accent font-semibold">Live</span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Today's brief label */}
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-600">Today's AI Brief</div>

          {/* AI thinking */}
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-indigo-300 font-medium"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span className="inline-flex gap-1">
                {[0,1,2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }} />
                ))}
              </span>
              Analyzing your calendar & tasks...
            </motion.div>
          )}

          {/* Risk card */}
          {!thinking && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Database Assignment</p>
                  <p className="text-sm font-bold text-white">Due tomorrow · 11:59 PM</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-red-400 leading-none">91<span className="text-lg">%</span></div>
                  <div className="text-xs text-red-500 font-semibold">MISS RISK</div>
                </div>
              </div>

              {/* Risk bar */}
              <div className="h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: riskFilled ? '91%' : 0 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                  style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
              </div>
              <p className="text-xs text-zinc-500">Busy calendar detected this afternoon</p>
            </motion.div>
          )}

          {/* AI Actions */}
          {actionsVisible && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">AI Actions Taken</p>
              {[
                { label: 'Recovery plan created', color: '#22c55e' },
                { label: 'Focus session scheduled', color: '#6366f1' },
                { label: 'Calendar optimized', color: '#a78bfa' },
              ].map((a, i) => (
                <motion.div key={a.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-bold" style={{ color: a.color }}>✓</span>
                  {a.label}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Mini productivity graph */}
          <div className="flex items-end gap-1 pt-1 h-10">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 92, 75, 88].map((h, i) => (
              <motion.div key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.05 * i + 1 }}
                className="flex-1 rounded-sm origin-bottom"
                style={{
                  height: `${h}%`,
                  background: h > 80 ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)'
                }} />
            ))}
          </div>
          <p className="text-xs text-zinc-600 text-center">Focus productivity · this week</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const dashRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!dashRef.current) return
      const x = (e.clientX / window.innerWidth  - 0.5) * 12
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      dashRef.current.style.transform = `perspective(1200px) rotateX(${y * 0.06}deg) rotateY(${x * 0.06}deg)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-10 pt-28 pb-20 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(99,102,241,0.14) 0%, transparent 65%),' +
          'radial-gradient(ellipse 40% 40% at 85% 55%, rgba(34,197,94,0.06) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(167,139,250,0.06) 0%, transparent 60%)',
      }} />
      <Particles />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-indigo-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-8 tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            AI Executive Assistant · Powered by Gemini
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(48px,6.5vw,80px)] font-black leading-[1.0] tracking-[-3px] mb-6"
          >
            Stop Missing<br />
            Deadlines<br />
            <span className="gradient-text">Before They</span><br />
            <span className="gradient-text">Happen.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg text-zinc-400 leading-relaxed max-w-md mb-9"
          >
            Sentri predicts deadline risks, restructures your schedule with AI,
            creates recovery plans, and keeps you ahead — before work becomes overwhelming.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <a href="/app/dashboard" className="px-7 py-3.5 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 animate-glow-pulse text-center inline-block">
              Launch Demo →
            </a>
            <button className="px-7 py-3.5 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2 justify-center">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">▶</span>
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-2 text-xs text-zinc-600"
          >
            <span>Powered by</span>
            {['Gemini', 'Firebase', 'Google Calendar'].map((t, i) => (
              <span key={t} className="flex items-center gap-1">
                {i > 0 && <span className="text-zinc-800">·</span>}
                <span className="text-zinc-500 font-semibold">{t}</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right */}
        <div ref={dashRef} style={{ transition: 'transform 0.12s ease' }}>
          <AIBrief />
        </div>
      </div>
    </section>
  )
}
