import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHASES = [
  { label: 'Analyzing Calendar…',       icon: '📅', duration: 800  },
  { label: 'Checking Schedule…',        icon: '⏰', duration: 700  },
  { label: 'Finding Conflicts…',        icon: '🔍', duration: 600  },
  { label: 'Calculating Risk…',         icon: '🧠', duration: 900  },
  { label: 'Generating Rescue Plan…',   icon: '🛟', duration: 600  },
]

export default function InteractiveDemo() {
  const [phase, setPhase] = useState(-1) // -1=idle, 0-4=thinking, 5=done
  const [running, setRunning] = useState(false)

  const run = async () => {
    if (running) return
    setRunning(true)
    setPhase(0)

    let delay = 0
    for (let i = 0; i < PHASES.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 0 : PHASES[i-1].duration))
      setPhase(i)
    }
    await new Promise(r => setTimeout(r, PHASES[PHASES.length-1].duration))
    setPhase(5)
    setRunning(false)
  }

  const reset = () => { setPhase(-1) }

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Live Demo</div>
        <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
          See the AI<br />
          <span className="gradient-text">think in real time.</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-md mx-auto">Hit the button and watch Sentri analyze a deadline risk from scratch.</p>
      </motion.div>

      <div className="max-w-lg mx-auto">
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-zinc-600 ml-2">sentri@ai ~ risk-engine</span>
          </div>

          <div className="p-6 min-h-64 flex flex-col items-center justify-center gap-4">
            <AnimatePresence mode="wait">
              {phase === -1 && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <p className="text-zinc-600 text-sm mb-6">Task: "Hackathon Submission" · Due Tomorrow</p>
                  <button
                    onClick={run}
                    className="px-8 py-4 font-bold text-white rounded-2xl text-base transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 animate-glow-pulse"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    ⚡ Predict My Deadline Risk
                  </button>
                </motion.div>
              )}

              {phase >= 0 && phase < 5 && (
                <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-2.5">
                  {PHASES.map((p, i) => (
                    <motion.div
                      key={p.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: i <= phase ? 1 : 0.2, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                      style={{ background: i === phase ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${i === phase ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}` }}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="text-sm font-medium text-zinc-300 flex-1">{p.label}</span>
                      {i < phase && <span className="text-accent font-bold text-sm">✓</span>}
                      {i === phase && (
                        <span className="flex gap-0.5">
                          {[0,1,2].map(j => (
                            <motion.span key={j} className="w-1.5 h-1.5 rounded-full bg-primary"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.6, delay: j * 0.15, repeat: Infinity }} />
                          ))}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {phase === 5 && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                  <div className="text-7xl font-black text-danger leading-none tracking-[-4px] mb-2">91%</div>
                  <div className="text-sm text-danger font-bold mb-4">MISS PROBABILITY DETECTED</div>

                  <div className="p-4 rounded-2xl mb-5 text-left" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-bold text-accent mb-2">🛟 Recovery Plan Ready</p>
                    <div className="space-y-1">
                      {['4-hour focus block created for 9am', 'Low-priority meetings moved', 'Draft outline generated'].map(s => (
                        <p key={s} className="text-xs text-zinc-400 flex items-center gap-2"><span className="text-accent">✓</span>{s}</p>
                      ))}
                    </div>
                  </div>

                  <button onClick={reset} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline">
                    Run again →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
