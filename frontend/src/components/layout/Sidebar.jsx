import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, AlertTriangle, Zap, Calendar,
  BarChart2, Bot, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Moon, Sun
} from 'lucide-react'
import { useAuth } from '../../app/AuthProvider'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/app/dashboard' },
  { icon: CheckSquare,     label: 'Tasks',         path: '/app/tasks' },
  { icon: AlertTriangle,   label: 'Risk Analysis', path: '/app/risk' },
  { icon: Zap,             label: 'Rescue Mode',   path: '/app/rescue', badgeKey: 'rescue' },
  { icon: Calendar,        label: 'Calendar',      path: '/app/calendar' },
  { icon: BarChart2,       label: 'Analytics',     path: '/app/analytics' },
  { icon: Bot,             label: 'AI Copilot',    path: '/app/copilot' },
  { icon: Bell,            label: 'Notifications', path: '/app/notifications', badgeKey: 'notifications' },
  { icon: Settings,        label: 'Settings',      path: '/app/settings' },
]

export default function Sidebar({ collapsed, onToggle, criticalCount = 2, unreadCount = 4 }) {
  const [dark, setDark] = useState(true)
  const { user, logout } = useAuth()

  const toggleTheme = () => {
    const nextDark = !dark
    setDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }

  const badgeCount = { rescue: criticalCount, notifications: unreadCount }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full border-r overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(9,9,11,0.95)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${collapsed ? 'justify-center' : ''}`}
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
          <Zap size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }} className="text-lg font-black tracking-tight">
              Sentri<span className="text-primary">.</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ icon: Icon, label, path, badgeKey }) => {
          const count = badgeKey ? badgeCount[badgeKey] : 0
          const isRescueUrgent = badgeKey === 'rescue' && count > 0

          return (
            <NavLink key={path} to={path} className="block">
              {({ isActive }) => (
                <div
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                  style={isActive ? { background: 'rgba(99,102,241,0.15)', boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)' } : {}}
                >
                  {isActive && (
                    <motion.div layoutId="active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary"
                      style={{ boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)' }} />
                  )}

                  <div className="relative flex-shrink-0">
                    <Icon size={18} className={`relative z-10 ${isActive ? 'text-primary' : ''}`} />
                    {isRescueUrgent && (
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 z-20"
                        style={{ boxShadow: '0 0 6px #ef4444' }}
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }} className="relative z-10 whitespace-nowrap flex-1">
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!collapsed && count > 0 && (
                    <span className="relative z-10 text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: badgeKey === 'rescue' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)',
                        color: badgeKey === 'rescue' ? '#ef4444' : '#818cf8',
                      }}>
                      {count}
                    </span>
                  )}

                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
                      style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {label}{count > 0 ? ` (${count})` : ''}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <Link to="/app/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {(user?.displayName || 'A')[0]}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-bg" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user?.displayName || 'Amit Singh'}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email || 'amit@sentri.ai'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <button onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-200 transition-all duration-200 hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
          {dark ? <Moon size={18} className="flex-shrink-0" /> : <Sun size={18} className="flex-shrink-0" />}
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{dark ? 'Dark Mode' : 'Light Mode'}</motion.span>}
          </AnimatePresence>
        </button>

        <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 transition-all duration-200 hover:bg-red-500/10 ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
          </AnimatePresence>
        </button>
      </div>

      <button onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-50"
        style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)' }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
