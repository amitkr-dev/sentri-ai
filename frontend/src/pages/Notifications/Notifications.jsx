import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, Info, ShieldAlert, CheckCircle, Check, Trash2, Calendar, Eye } from 'lucide-react'
import { dataHub } from '../../services/dataHub'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all') // all | unread | critical

  const loadNotifications = async () => {
    const list = await dataHub.getNotifications()
    setItems(list)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  // Filter logic
  const filteredItems = useMemo(() => {
    return items.filter(n => {
      if (filter === 'unread') return !n.read
      if (filter === 'critical') return n.category === 'critical'
      return true
    })
  }, [items, filter])

  const handleMarkAllRead = async () => {
    const list = [...items]
    for (const n of list) {
      if (!n.read) {
        n.read = true
        await dataHub.saveNotification(n)
      }
    }
    loadNotifications()
  }

  const handleToggleRead = async (id) => {
    const found = items.find(n => n.id === id)
    if (found) {
      found.read = !found.read
      await dataHub.saveNotification(found)
      loadNotifications()
    }
  }

  const handleDelete = async (id) => {
    await dataHub.deleteNotification(id)
    loadNotifications()
  }

  const handleActionResolve = async (id) => {
    const found = items.find(n => n.id === id)
    if (found) {
      found.read = true
      found.resolved = true
      found.title = 'Schedule optimized successfully'
      found.text = 'Sentri autopilot cleared conflict. Focus blocks synced.'
      await dataHub.saveNotification(found)
      
      // If resolving p1 calendar conflict, add focus block and remove standup
      if (id === 'n1') {
        const newBlock = {
          id: 'evt_p1_focus',
          title: 'Deep Work: Webhook Migration',
          source: 'ai_focus',
          start: 9,
          end: 12.5,
          reason: 'Restructured autonomously after standup sync reschedule approved.'
        }
        await dataHub.saveCalendarEvent(newBlock)
        await dataHub.deleteCalendarEvent('evt_1')
        window.dispatchEvent(new Event('calendarUpdated'))
      }
      
      loadNotifications()
    }
  }

  const getCategoryConfig = (cat) => {
    if (cat === 'critical') {
      return {
        icon: ShieldAlert,
        color: '#ef4444',
        border: 'border-red-500/20',
        bg: 'bg-red-500/5',
        iconBg: 'bg-red-500/10'
      }
    }
    if (cat === 'warning') {
      return {
        icon: AlertTriangle,
        color: '#f59e0b',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/5',
        iconBg: 'bg-amber-500/10'
      }
    }
    return {
      icon: Info,
      color: '#6366f1',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
      iconBg: 'bg-indigo-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-card border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-white">Notifications Inbox</h3>
          <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
            {items.filter(n => !n.read).length} Unread
          </span>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={items.filter(n => !n.read).length === 0}
          className="text-xs font-semibold hover:text-white text-zinc-400 active:scale-95 transition-all disabled:opacity-30"
        >
          Mark all as read
        </button>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'critical', label: 'Critical Errors' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === tab.id
                ? 'bg-zinc-900 border border-zinc-855 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3 min-h-[250px]">
        <AnimatePresence initial={false}>
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-500 mb-3 border border-zinc-800">
                <Check size={18} />
              </div>
              <h4 className="text-sm font-bold text-zinc-300">Inbox Clear</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">You have resolved all notification alerts for this index.</p>
            </motion.div>
          ) : (
            filteredItems.map((n) => {
              const cfg = getCategoryConfig(n.category)
              const Icon = cfg.icon

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${cfg.border} ${cfg.bg} ${
                    n.read ? 'opacity-55' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    
                    {/* Icon block */}
                    <div className={`p-2.5 rounded-xl ${cfg.iconBg} flex-shrink-0 flex items-center justify-center`}>
                      <Icon size={16} style={{ color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        <span className="text-[9px] text-zinc-550 font-medium whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-normal">{n.text}</p>

                      {n.actionLabel && !n.resolved && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleActionResolve(n.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/5 text-[10px] font-bold transition-all active:scale-95"
                          >
                            <Calendar size={11} /> {n.actionLabel}
                          </button>
                        </div>
                      )}

                      {n.resolved && (
                        <div className="pt-2 flex items-center gap-1 text-[10px] font-bold text-accent">
                          <CheckCircle size={11} /> Rescheduled Autonomously
                        </div>
                      )}
                    </div>

                    {/* Check / Trash Control Bins */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleRead(n.id)}
                        title={n.read ? 'Mark unread' : 'Mark read'}
                        className="p-1.5 rounded-lg border border-zinc-805 hover:border-zinc-705 bg-zinc-950 text-zinc-500 hover:text-zinc-300 transition-all"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        title="Dismiss notification"
                        className="p-1.5 rounded-lg border border-zinc-805 hover:border-danger/35 bg-zinc-950 text-zinc-500 hover:text-danger transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
