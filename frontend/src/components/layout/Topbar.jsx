import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Command, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'

const PAGE_META = {
  '/app/dashboard':     { title: 'Dashboard',      subtitle: 'Your AI command center' },
  '/app/tasks':         { title: 'Tasks',           subtitle: 'Everything you\'re working on' },
  '/app/risk':          { title: 'Risk Analysis',   subtitle: 'Portfolio-level risk across all tasks' },
  '/app/rescue':        { title: 'Rescue Mode',     subtitle: 'AI-driven crisis intervention' },
  '/app/calendar':      { title: 'Calendar',        subtitle: 'See what Sentri changed, and why' },
  '/app/analytics':     { title: 'Analytics',       subtitle: 'Patterns Sentri has learned about you' },
  '/app/copilot':       { title: 'AI Copilot',      subtitle: 'Ask anything. It can act, too.' },
  '/app/notifications': { title: 'Notifications',   subtitle: 'What needs your attention' },
  '/app/settings':      { title: 'Settings',        subtitle: 'Account, AI permissions, integrations' },
}

export default function Topbar() {
  const [focused, setFocused] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const meta = PAGE_META[pathname] || PAGE_META['/app/dashboard']

  const { searchQuery, setSearchQuery, notifications, saveNotification } = useTaskStore()

  const unreadCount = notifications.filter(n => !n.read).length
  const displayNotifs = notifications.slice(0, 5)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 relative"
      style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)', zIndex: 40 }}
    >
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-white leading-tight">{meta.title}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{meta.subtitle}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-200"
            style={{ color: focused ? '#6366f1' : undefined }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (pathname !== '/app/tasks') {
                navigate('/app/tasks')
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-52 text-sm bg-white/5 border rounded-xl pl-8 pr-16 py-2 text-zinc-300 placeholder-zinc-600 outline-none transition-all duration-200"
            style={{
              borderColor: focused ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)',
              boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            }}
          />
          {!focused && !searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-xs text-zinc-600 pointer-events-none">
              <Command size={10} />K
            </span>
          )}
        </div>

        {/* Bell / Notifications dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200 hover:bg-white/8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-black text-white flex items-center justify-center" style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}>
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                {/* Click-away backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                  style={{ backdropFilter: 'blur(30px)' }}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bell size={12} className="text-primary" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold text-zinc-500">{unreadCount} unread</span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {displayNotifs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-zinc-500">
                        No notifications to show.
                      </div>
                    ) : (
                      displayNotifs.map((item) => {
                        const Icon = item.category === 'critical' ? ShieldAlert : AlertTriangle
                        const color = item.category === 'critical' ? '#ef4444' : '#f59e0b'
                        return (
                          <div 
                            key={item.id}
                            className={`p-2.5 rounded-xl transition-colors flex items-start gap-2.5 border border-transparent ${item.read ? 'bg-transparent opacity-60' : 'bg-white/3 hover:bg-white/5 border-zinc-800/30'}`}
                          >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                              <Icon size={12} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-zinc-200 truncate">{item.title}</p>
                                {!item.read && (
                                  <button 
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      await saveNotification({ ...item, read: true })
                                    }}
                                    className="text-[9px] text-primary hover:text-indigo-300 font-bold"
                                  >
                                    Read
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">{item.text}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-900 flex justify-center">
                    <button 
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/app/notifications')
                      }}
                      className="text-[11px] font-bold text-primary hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      View all notifications <Command size={10} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/app/settings')}>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-sm font-bold text-white">A</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-bg" />
          </div>
          <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </div>
      </div>
    </motion.header>
  )
}
