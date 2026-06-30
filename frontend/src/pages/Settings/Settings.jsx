import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, RefreshCw, MessageSquare, Calendar, Github, ShieldAlert, CheckCircle, Info, Lock } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

export default function Settings() {
  const { settings, saveSettings, fetchTasks } = useTaskStore()
  const [autopilotLevel, setAutopilotLevel] = useState('standard') // conservative | standard | crisis
  const [slackConnected, setSlackConnected] = useState(true)
  const [githubConnected, setGithubConnected] = useState(false)
  const [allowAutoDeclines, setAllowAutoDeclines] = useState(true)
  const [notifyBeforeReschedule, setNotifyBeforeReschedule] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (settings) {
      setAutopilotLevel(settings.autopilotLevel || 'standard')
      setSlackConnected(settings.slackConnected ?? true)
      setGithubConnected(settings.githubConnected ?? false)
      setAllowAutoDeclines(settings.allowAutoDeclines ?? true)
      setNotifyBeforeReschedule(settings.notifyBeforeReschedule ?? false)
    }
  }, [settings])

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    
    await saveSettings({
      autopilotLevel,
      slackConnected,
      githubConnected,
      allowAutoDeclines,
      notifyBeforeReschedule
    })

    setTimeout(() => {
      setIsSaving(false)
      setShowToast(true)
      
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    }, 800)
  }

  const toggleGithub = () => {
    setGithubConnected(prev => !prev)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      
      {/* Save Toast Indicator */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-accent border border-accent/40 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={14} className="animate-pulse" /> Settings updated successfully! ⚙️
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Autopilot Level Selector */}
        <div className="bg-card border border-zinc-805 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={13} className="text-primary" /> AI Autopilot Aggression
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Configure how proactively Sentri declutters your calendar to protect tasks.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'conservative', label: 'Conservative', desc: 'Reserves 2h blocks. Only declines optional syncs.' },
              { id: 'standard', label: 'Standard (Rec)', desc: 'Reserves 4h blocks. Reschedules standard 1-on-1s.' },
              { id: 'crisis', label: 'Crisis Mode', desc: 'Reserves 6.5h blocks. Declines all internal syncs.' }
            ].map(lvl => {
              const active = lvl.id === autopilotLevel
              return (
                <div
                  key={lvl.id}
                  onClick={() => setAutopilotLevel(lvl.id)}
                  className={`rounded-xl p-3 border text-center cursor-pointer transition-all duration-205 flex flex-col justify-between ${
                    active
                      ? 'bg-primary/5 border-primary/45 text-white'
                      : 'bg-zinc-950/20 border-zinc-800/80 hover:border-zinc-700 text-zinc-500'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{lvl.label}</span>
                  <span className="text-[9px] text-zinc-550 block leading-tight mt-2">{lvl.desc}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Integrations Config */}
        <div className="bg-card border border-zinc-805 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw size={13} className="text-primary" /> Third-party Sync Channels
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Manage API connection layers for task metrics and schedules.</p>
          </div>

          <div className="space-y-3">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/30">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-red-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-200">Google Calendar</span>
                  <span className="block text-[9px] text-zinc-500">Synced as amit@sentri.ai</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 px-2 py-1 rounded bg-zinc-900 border">Connected</span>
            </div>

            {/* Slack */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/30">
              <div className="flex items-center gap-3">
                <MessageSquare size={16} className="text-sky-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-200">Slack workspace status sync</span>
                  <span className="block text-[9px] text-zinc-500">Updates DND status during Focus blocks</span>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slackConnected}
                  onChange={(e) => setSlackConnected(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white" />
              </label>
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950/30">
              <div className="flex items-center gap-3">
                <Github size={16} className="text-white" />
                <div>
                  <span className="text-xs font-bold text-zinc-200">GitHub codebase mapping</span>
                  <span className="block text-[9px] text-zinc-500">Links repositories to audit codebase blockers</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleGithub}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg border active:scale-95 transition-all ${
                  githubConnected
                    ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                    : 'bg-primary text-white border-primary/20 hover:bg-indigo-500 shadow-md shadow-primary/10'
                }`}
              >
                {githubConnected ? 'Disconnect' : 'Connect API'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. AI Permissions Switches */}
        <div className="bg-card border border-zinc-855 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={13} className="text-primary" /> Autopilot Reschedule Permissions
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Regulate scheduling decision levels permitted for Sentri AI.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 max-w-[85%]">
                <span className="text-xs font-semibold text-zinc-250 block">Allow Autonomous Sync Declines</span>
                <span className="text-[10px] text-zinc-500 block leading-normal">
                  Allows Sentri to automatically decline internal sync meetings and send custom text summaries without prompts.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={allowAutoDeclines}
                  onChange={(e) => setAllowAutoDeclines(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white" />
              </label>
            </div>

            <div className="flex items-start justify-between">
              <div className="space-y-0.5 max-w-[85%]">
                <span className="text-xs font-semibold text-zinc-250 block">Notify Before Scheduling Changes</span>
                <span className="text-[10px] text-zinc-500 block leading-normal">
                  Sends calendar reschedule proposals to your notifications inbox instead of executing autonomously.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={notifyBeforeReschedule}
                  onChange={(e) => setNotifyBeforeReschedule(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white" />
              </label>
            </div>
          </div>
        </div>

        {/* 4. Action save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20 hover:bg-indigo-500"
          >
            {isSaving ? <RefreshCw size={13} className="animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  )
}
