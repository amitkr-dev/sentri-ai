import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'What makes Sentri different from other productivity apps?',
    a: 'Other apps remind you about deadlines. Sentri predicts them. Our AI analyzes 14 behavioral signals — your calendar density, past task velocity, complexity, and dependencies — to calculate how likely you are to miss a deadline days before it\'s an emergency. Then it acts.',
  },
  {
    q: 'How does AI calculate deadline risk?',
    a: 'Sentri uses Gemini 2.0 Flash to analyze: available time vs estimated hours, your historical completion rate on similar tasks, calendar density, existing blockers, and your typical focus patterns. The result is a 0-100% miss probability with a full explanation.',
  },
  {
    q: 'Can Sentri modify my Google Calendar?',
    a: 'Yes — with your permission. Sentri can clear low-priority meetings, create deep work blocks, and restructure your schedule to protect time for high-risk tasks. You always see what changed and can revert with one click.',
  },
  {
    q: 'Does Sentri support voice commands?',
    a: 'Yes. You can add tasks, ask about your risk status, and trigger Rescue Mode entirely through voice. The AI understands natural language like "add hackathon submission due Friday" or "what\'s my riskiest task today?".',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Sentri uses Firebase Authentication with Google OAuth, data is stored in Firestore with user-level security rules, and calendar access is read/write only with explicit user permission. Your data never trains our models.',
  },
]

function Item({ q, a, open, toggle }) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors pr-6">{q}</span>
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{ background: open ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}` }}
        >
          {open ? <Minus size={13} className="text-primary" /> : <Plus size={13} className="text-zinc-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-500 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4">FAQ</div>
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
            Questions,<br />
            <span className="gradient-text">answered.</span>
          </h2>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Everything you need to know about Sentri and how it keeps you ahead.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {FAQS.map((faq, i) => (
            <Item
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={open === i}
              toggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
