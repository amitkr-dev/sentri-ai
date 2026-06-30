import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Shield, CheckCircle, RefreshCw, Key, Check } from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  
  const [displayName, setDisplayName] = useState(user?.displayName || 'Amit Singh')
  const [email, setEmail] = useState(user?.email || 'amit@sentri.ai')
  const [slack, setSlack] = useState('@amit.singh')
  
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    
    setTimeout(() => {
      updateProfile({ displayName, email })
      setIsSaving(false)
      setShowToast(true)
      
      // Auto-hide toast
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    }, 1200)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      
      {/* Toast Save updates */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-accent border border-accent/40 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={14} className="animate-pulse" /> Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary/20 via-violet-500/10 to-transparent border-b border-zinc-850" />
        
        <div className="px-6 pb-6 relative">
          
          {/* Avatar overlay */}
          <div className="absolute -top-12 left-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 border-4 border-bg flex items-center justify-center text-3xl font-black text-white shadow-xl">
                A
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-accent border-2 border-bg flex items-center justify-center text-[10px] text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>
          </div>

          <div className="pt-10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{displayName}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Teammate · Developer</p>
            </div>
            
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
              Active Member
            </span>
          </div>

        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile form inputs */}
        <div className="bg-card border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-primary" /> Profile Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Slack Handle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Slack Member ID</label>
              <input
                type="text"
                required
                value={slack}
                onChange={(e) => setSlack(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Security / Password section */}
        <div className="bg-card border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Key size={13} className="text-primary" /> Session Security
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-zinc-250 block">Password Authentication</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Password has not been updated since mock login session.</span>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-zinc-300 hover:text-white transition-all hover:border-zinc-700 text-[10px] active:scale-95"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20 hover:bg-indigo-500"
          >
            {isSaving ? <RefreshCw size={13} className="animate-spin" /> : null}
            {isSaving ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>
    </div>
  )
}
