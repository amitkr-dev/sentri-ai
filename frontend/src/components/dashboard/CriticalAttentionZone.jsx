import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Check, X, Pencil, Sparkles, Clock, Calendar, MessageSquare, ChevronRight } from 'lucide-react'
import { dataHub } from '../../services/dataHub'

import { useTaskStore } from '../../store/taskStore'

function getIconForAction(label) {
  const lower = label.toLowerCase()
  if (lower.includes('sync') || lower.includes('move') || lower.includes('calendar')) return Calendar
  if (lower.includes('notify') || lower.includes('ping') || lower.includes('message')) return MessageSquare
  return Clock
}

function ActionMiniPill({ icon: Icon, label, i }) {
  const ResolvedIcon = Icon || getIconForAction(label)
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + i * 0.08 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <ResolvedIcon size={12} className="text-primary flex-shrink-0" />
      {label}
    </motion.div>
  )
}

function ProposalCard({ proposal, onResolve }) {
  const [state, setState] = useState('pending') // pending | approving | approved | dismissing | modifying
  const [editTime, setEditTime] = useState('9:00 AM')

  const handleApprove = () => {
    setState('approving')
    setTimeout(() => {
      setState('approved')
      setTimeout(() => onResolve(proposal.id, 'approved'), 1100)
    }, 650)
  }

  const handleDismiss = () => {
    setState('dismissing')
    setTimeout(() => onResolve(proposal.id, 'dismissed'), 450)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(24,24,27,0.85)',
        border: state === 'approved' ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.22)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Pulsing left edge to signal urgency */}
      {state === 'pending' && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: '#ef4444', boxShadow: '0 0 12px #ef4444' }}
        />
      )}

      <div className="p-5">
        <AnimatePresence mode="wait">
          {state === 'approved' ? (
            <motion.div
              key="approved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 py-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Check size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-accent">Plan executed</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Risk reduced {proposal.risk}% → <span className="text-accent font-semibold">{proposal.newRisk}%</span> · 3 actions taken
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="active" exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100">{proposal.task}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Due {proposal.deadline}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-red-400 leading-none">{proposal.risk}%</div>
                  <div className="text-[10px] text-red-500 font-bold tracking-wide">RISK</div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed mb-3 pl-12">{proposal.reason}</p>

              {/* AI proposal label */}
              <div className="flex items-center gap-1.5 mb-2.5 pl-12">
                <Sparkles size={11} className="text-primary" />
                <span className="text-xs font-bold text-indigo-300">Sentri proposes:</span>
              </div>

              {/* Action pills */}
              <div className="flex flex-wrap gap-1.5 mb-4 pl-12">
                {proposal.actions.map((a, i) => (
                  <ActionMiniPill key={a.label} icon={a.icon} label={a.label} i={i} />
                ))}
              </div>

              {/* Modify inline editor */}
              <AnimatePresence>
                {state === 'modifying' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-12 mb-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <span className="text-xs text-zinc-400">Focus block start time:</span>
                      <input
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white outline-none focus:border-primary w-24"
                      />
                      <button
                        onClick={handleApprove}
                        className="ml-auto text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors"
                      >
                        Confirm & Run
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              {state !== 'modifying' && (
                <div className="flex items-center gap-2 pl-12">
                  <button
                    onClick={handleApprove}
                    disabled={state === 'approving' || state === 'dismissing'}
                    className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}
                  >
                    {state === 'approving' ? (
                      <>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                          <Sparkles size={12} />
                        </motion.span>
                        Executing...
                      </>
                    ) : (
                      <><Check size={12} /> Approve</>
                    )}
                  </button>
                  <button
                    onClick={() => setState('modifying')}
                    disabled={state === 'approving' || state === 'dismissing'}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 px-3.5 py-2 rounded-lg transition-all duration-200 hover:bg-white/5 disabled:opacity-50"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Pencil size={11} /> Modify
                  </button>
                  <button
                    onClick={handleDismiss}
                    disabled={state === 'approving' || state === 'dismissing'}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 px-3 py-2 rounded-lg transition-all duration-200 hover:text-zinc-300 hover:bg-white/5 disabled:opacity-50 ml-auto"
                  >
                    <X size={11} /> Dismiss
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function CriticalAttentionZone() {
  const { proposals, approveProposal, dismissProposal } = useTaskStore()

  const handleResolve = async (id, outcome) => {
    if (outcome === 'approved') {
      await approveProposal(id)
    } else {
      dismissProposal(id)
    }
  }

  if (proposals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Check size={20} className="text-accent" />
        </div>
        <p className="text-sm font-bold text-accent">Everything's under control</p>
        <p className="text-xs text-zinc-500 mt-1">Sentri resolved all critical risks. Nothing needs your attention right now.</p>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-red-500"
            style={{ boxShadow: '0 0 8px #ef4444' }}
          />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Needs Your Approval</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            {proposals.length}
          </span>
        </div>
        <Link to="/app/notifications" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          View all activity <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} onResolve={handleResolve} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
