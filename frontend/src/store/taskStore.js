import { create } from 'zustand'
import { db, auth, analytics } from '../firebase/config'
import { collection, doc, onSnapshot, query, where, setDoc, deleteDoc } from 'firebase/firestore'
import { taskService } from '../services/task.service'
import { logEvent } from 'firebase/analytics'
import { calendarService } from '../services/calendar.service'

const isFirestoreActive = () => !!db && !!auth?.currentUser?.uid

const INITIAL_PROPOSALS = [
  {
    id: 'p1',
    task: 'Hackathon Submission',
    risk: 91,
    reason: 'Busy calendar detected this afternoon + scope underestimated by ~35%',
    actions: [
      { label: 'Move 2:00 PM sync to tomorrow' },
      { label: 'Create 3-hour focus block at 9:00 AM' },
      { label: 'Notify teammate Priya about timeline' },
    ],
    deadline: 'Tomorrow, 11:59 PM',
    newRisk: 23,
  },
  {
    id: 'p2',
    task: 'API Integration',
    risk: 78,
    reason: '2 unresolved dependencies blocking progress for 2 days',
    actions: [
      { label: 'Ping backend team for API keys' },
      { label: 'Reschedule low-priority standup' },
    ],
    deadline: 'Tuesday, 6:00 PM',
    newRisk: 35,
  },
]

const getDerivedState = (tasks) => {
  const active = tasks.filter(t => t.status !== 'done')
  const criticalTasks = active.filter(t => t.risk >= 75)
  const criticalCount = criticalTasks.length
  
  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return false
    const dl = t.deadline.toLowerCase()
    return dl.includes('tomorrow') || dl.includes('today') || dl.includes('1 day ago') || dl.includes('in 2 days')
  })

  return { criticalTasks, criticalCount, todayTasks }
}

export const useTaskStore = create((set, get) => ({
  tasks: [],
  proposals: [],
  dismissedCount: 0,
  criticalTasks: [],
  criticalCount: 0,
  todayTasks: [],
  activityLogs: [],
  notifications: [],
  calendarEvents: [],
  settings: {
    autopilotLevel: 'standard',
    slackConnected: true,
    githubConnected: false,
    allowAutoDeclines: true,
    notifyBeforeReschedule: false
  },
  aiInsights: [],
  aiInsightsLoading: false,
  isCalendarConnected: !!localStorage.getItem('gcal_access_token'),
  isConnectingCalendar: false,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  isSubscribed: false,
  currentUserId: null,
  unsubscribes: [],

  subscribeAll: (userId) => {
    const { isSubscribed, currentUserId, unsubscribeAll } = get()
    if (isSubscribed && currentUserId === userId) {
      console.log("[DEBUG] subscribeAll: already subscribed to userId:", userId)
      return
    }
    
    if (isSubscribed) {
      console.log(`[DEBUG] subscribeAll: userId changed from ${currentUserId} to ${userId}. Unsubscribing old listeners.`)
      unsubscribeAll()
    }
    
    console.log("[DEBUG] subscribeAll: subscribing to userId:", userId)
    set({ isSubscribed: true, currentUserId: userId })

    if (isFirestoreActive()) {
      // Seed user database in background if empty
      taskService.seedUserDatabase(userId).catch(err => {
        console.error("[DEBUG] Seeding database failed:", err)
      })
    }

    if (!isFirestoreActive()) {
      // Fallback: set up simulated updates using localStorage
      const loadLocal = () => {
        const tasks = JSON.parse(localStorage.getItem('sentri_tasks') || '[]')
        const logs = JSON.parse(localStorage.getItem('sentri_activity_logs') || '[]')
        const notifs = JSON.parse(localStorage.getItem('sentri_notifications') || '[]')
        const events = JSON.parse(localStorage.getItem('sentri_calendar') || '[]')
        const settings = JSON.parse(localStorage.getItem('sentri_settings') || 'null')

        set({
          tasks: tasks.length ? tasks : [],
          activityLogs: logs.length ? logs : [],
          notifications: notifs.length ? notifs : [],
          calendarEvents: events.length ? events : [],
          settings: settings || get().settings,
          ...getDerivedState(tasks.length ? tasks : [])
        })
      }
      loadLocal()
      const interval = setInterval(loadLocal, 1500)
      set({ unsubscribes: [() => clearInterval(interval)] })
      return
    }

    try {
      const qTasks = query(collection(db, 'tasks'), where('userId', '==', userId))
      const unsubTasks = onSnapshot(qTasks, (snap) => {
        const list = []
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        set({ tasks: list, ...getDerivedState(list) })
        get().updateAIInsights(list)
      }, (error) => {
        console.error("Firestore tasks listener error:", error)
      })

      const qProposals = query(collection(db, 'proposals'), where('userId', '==', userId))
      const unsubProposals = onSnapshot(qProposals, (snap) => {
        const list = []
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        set({ proposals: list })
      }, (error) => {
        console.error("Firestore proposals listener error:", error)
      })

      const qLogs = query(collection(db, 'activity_logs'), where('userId', '==', userId))
      const unsubLogs = onSnapshot(qLogs, (snap) => {
        const list = []
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        set({ activityLogs: list })
      }, (error) => {
        console.error("Firestore activity_logs listener error:", error)
      })

      const qNotifs = query(collection(db, 'notifications'), where('userId', '==', userId))
      const unsubNotifs = onSnapshot(qNotifs, (snap) => {
        const list = []
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        set({ notifications: list })
      }, (error) => {
        console.error("Firestore notifications listener error:", error)
      })

      const qCalendar = query(collection(db, 'calendarEvents'), where('userId', '==', userId))
      const unsubCalendar = onSnapshot(qCalendar, (snap) => {
        if (get().isCalendarConnected) {
          console.log("[DEBUG] isCalendarConnected is active, ignoring Firestore snapshot for calendarEvents")
          return
        }
        const list = []
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() })
        })
        set({ calendarEvents: list })
      }, (error) => {
        console.error("Firestore calendarEvents listener error:", error)
      })

      const unsubSettings = onSnapshot(doc(db, 'settings', userId), (docSnap) => {
        if (docSnap.exists()) {
          set({ settings: docSnap.data() })
        }
      }, (error) => {
        console.error("Firestore settings listener error:", error)
      })

      set({
        unsubscribes: [unsubTasks, unsubProposals, unsubLogs, unsubNotifs, unsubCalendar, unsubSettings]
      })
    } catch (e) {
      console.warn("Failed to subscribe in real-time", e)
    }
  },

  unsubscribeAll: () => {
    console.log("[DEBUG] unsubscribeAll: cleaning up all subscriptions")
    get().unsubscribes.forEach(unsub => {
      try { unsub() } catch (e) {}
    })
    set({ unsubscribes: [], isSubscribed: false, currentUserId: null })
  },


  fetchTasks: async () => {
    const userId = isFirestoreActive() ? auth.currentUser.uid : 'mock-user-123'
    get().subscribeAll(userId)
    if (!isFirestoreActive()) {
      const list = await taskService.getTasks()
      set({ tasks: list, ...getDerivedState(list) })
    }
    if (get().isCalendarConnected) {
      await get().fetchCalendarEvents()
    }
    return get().tasks
  },

  createTask: async (task) => {
    console.log("store.createTask() started with task:", task)
    try {
      const t = await taskService.createTask(task)
      console.log("store.createTask() success")
      
      // Log Analytics Event
      if (analytics) {
        try {
          logEvent(analytics, 'task_created', { title: t.title, tag: t.tag })
        } catch (e) {
          console.warn("Analytics log failed", e)
        }
      }

      if (isFirestoreActive()) {
        console.log("[DEBUG] Firestore is active. Relying on Cloud Function trigger for Gemini analysis.");
      } else {
        console.log("[DEBUG] Fallback mode active, reloading tasks manually");
        await get().fetchTasks()
      }
      return t
    } catch (err) {
      console.error("store.createTask() failed:", err)
      throw err
    }
  },

  analyzeTaskAI: async (taskId, title, description, risk, deadline, tag) => {
    console.log("[DEBUG] Gemini task analysis started for task:", taskId)
    try {
      const { geminiService } = await import('../services/ai.service')
      const analysis = await geminiService.predictRisk({ title, description, risk, deadline, tag })
      console.log("[DEBUG] Gemini task analysis completed:", analysis)
      
      // Update the task in Firestore
      await taskService.updateTask(taskId, {
        aiAnalysis: analysis,
        risk: Number(analysis.risk), // Update task risk with AI calculation
        priority: analysis.priority,
        estimatedHours: Number(analysis.estimatedHours),
        complexity: analysis.complexity,
        reasoning: [
          `Sentri AI Analysis completed: Estimated ${analysis.estimatedHours} hours`,
          analysis.reason
        ],
        actions: analysis.actions,
        executionPlan: analysis.executionPlan,
        ghostDraft: analysis.ghostDraft
      })

      // Log Analytics Event
      if (analytics) {
        try {
          logEvent(analytics, 'ai_analysis_completed', { taskId, risk: analysis.risk })
        } catch (e) {
          console.warn("Analytics log failed", e)
        }
      }

      // If risk >= 75, automatically generate a restructuring proposal!
      if (analysis.risk >= 75) {
        console.log("[DEBUG] Task risk is critical. Generating restructuring proposal...")
        const userId = auth?.currentUser?.uid
        if (userId) {
          const proposalId = `p_${taskId}`
          const proposalDoc = {
            id: proposalId,
            userId,
            taskId,
            task: title,
            risk: analysis.risk,
            reason: analysis.reason,
            actions: (analysis.actions || ["Reschedule overlapping syncs"]).map(act => ({ label: act })),
            deadline,
            newRisk: Math.round(analysis.risk * 0.25)
          }
          await setDoc(doc(db, 'proposals', proposalId), proposalDoc)
          console.log("[DEBUG] Restructuring proposal created in Firestore:", proposalId)
        }
      }
    } catch (err) {
      console.error("[DEBUG] Gemini task analysis failed:", err)
    }
  },

  updateAIInsights: async (tasks) => {
    if (!tasks || tasks.length === 0) return
    if (get().aiInsightsLoading) return
    
    // Simple verification check to avoid calling API too frequently
    const activeTasksKey = tasks.filter(t => t.status !== 'done').map(t => `${t.id}_${t.risk}`).join(',')
    if (get().lastActiveTasksKey === activeTasksKey) return
    set({ lastActiveTasksKey: activeTasksKey })

    set({ aiInsightsLoading: true })
    try {
      const { geminiService } = await import('../services/ai.service')
      const insights = await geminiService.generateInsights(tasks)
      set({ aiInsights: insights, aiInsightsLoading: false })
    } catch (err) {
      console.error("[DEBUG] Error updating AI insights:", err)
      set({ aiInsightsLoading: false })
    }
  },


  updateTask: async (id, updates) => {
    await taskService.updateTask(id, updates)
    if (!isFirestoreActive()) {
      await get().fetchTasks()
    }
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id)
    
    // Log Analytics Event
    if (analytics) {
      try {
        logEvent(analytics, 'task_deleted', { taskId: id })
      } catch (e) {
        console.warn("Analytics log failed", e)
      }
    }

    if (!isFirestoreActive()) {
      await get().fetchTasks()
    }
  },

  updateStatus: async (id, status) => {
    await taskService.updateStatus(id, status)
    
    // Log Analytics Event
    if (analytics) {
      try {
        logEvent(analytics, 'task_status_updated', { taskId: id, status })
        if (status === 'done') {
          logEvent(analytics, 'task_completed', { taskId: id })
        }
      } catch (e) {
        console.warn("Analytics log failed", e)
      }
    }

    if (!isFirestoreActive()) {
      await get().fetchTasks()
    }
  },

  approveProposal: async (id) => {
    await taskService.approveProposal(id)
    set(state => ({
      proposals: state.proposals.filter(p => p.id !== id)
    }))

    // Log Analytics Event
    if (analytics) {
      try {
        logEvent(analytics, 'proposal_approved', { proposalId: id })
      } catch (e) {
        console.warn("Analytics log failed", e)
      }
    }
  },

  dismissProposal: async (id) => {
    // If in firestore, delete proposal from firestore
    const userId = auth?.currentUser?.uid
    if (isFirestoreActive() && userId) {
      try {
        await deleteDoc(doc(db, 'proposals', id))
      } catch (err) {
        console.error("Failed to delete dismissed proposal from firestore", err)
      }
    }
    
    set(state => ({
      proposals: state.proposals.filter(p => p.id !== id),
      dismissedCount: state.dismissedCount + 1
    }))

    // Log Analytics Event
    if (analytics) {
      try {
        logEvent(analytics, 'proposal_dismissed', { proposalId: id })
      } catch (e) {
        console.warn("Analytics log failed", e)
      }
    }
  },

  activateRescue: async (taskId) => {
    await taskService.activateRescue(taskId)
    
    // Log Analytics Event
    if (analytics) {
      try {
        logEvent(analytics, 'calendar_rescue_triggered', { taskId })
      } catch (e) {
        console.warn("Analytics log failed", e)
      }
    }

    if (!isFirestoreActive()) {
      await get().fetchTasks()
    }
  },

  saveNotification: async (notif) => {
    if (!isFirestoreActive()) {
      const list = JSON.parse(localStorage.getItem('sentri_notifications') || '[]')
      const idx = list.findIndex(n => n.id === notif.id)
      if (idx >= 0) list[idx] = notif
      else list.push(notif)
      localStorage.setItem('sentri_notifications', JSON.stringify(list))
      await get().fetchTasks()
      return
    }
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif)
    } catch (e) {
      console.error(e)
    }
  },

  deleteNotification: async (id) => {
    if (!isFirestoreActive()) {
      const list = JSON.parse(localStorage.getItem('sentri_notifications') || '[]')
      const filtered = list.filter(n => n.id !== id)
      localStorage.setItem('sentri_notifications', JSON.stringify(filtered))
      await get().fetchTasks()
      return
    }
    try {
      await deleteDoc(doc(db, 'notifications', id))
    } catch (e) {
      console.error(e)
    }
  },

  saveCalendarEvent: async (ev) => {
    if (!isFirestoreActive()) {
      const list = JSON.parse(localStorage.getItem('sentri_calendar') || '[]')
      const idx = list.findIndex(e => e.id === ev.id)
      if (idx >= 0) list[idx] = ev
      else list.push(ev)
      localStorage.setItem('sentri_calendar', JSON.stringify(list))
      await get().fetchTasks()
      return
    }
    try {
      const userId = auth?.currentUser?.uid
      const scopedEv = userId ? { ...ev, userId } : ev
      await setDoc(doc(db, 'calendarEvents', ev.id), scopedEv)
    } catch (e) {
      console.error(e)
    }
  },

  deleteCalendarEvent: async (id) => {
    if (!isFirestoreActive()) {
      const list = JSON.parse(localStorage.getItem('sentri_calendar') || '[]')
      const filtered = list.filter(e => e.id !== id)
      localStorage.setItem('sentri_calendar', JSON.stringify(filtered))
      await get().fetchTasks()
      return
    }
    try {
      await deleteDoc(doc(db, 'calendarEvents', id))
    } catch (e) {
      console.error(e)
    }
  },

  saveSettings: async (settings) => {
    const userId = auth?.currentUser?.uid
    if (!isFirestoreActive() || !userId) {
      localStorage.setItem('sentri_settings', JSON.stringify(settings))
      set({ settings })
      return
    }
    try {
      await setDoc(doc(db, 'settings', userId), { ...settings, userId })
    } catch (e) {
      console.error(e)
    }
  },

  connectGoogleCalendar: async () => {
    set({ isConnectingCalendar: true })
    try {
      await calendarService.connectCalendar()
      set({ isCalendarConnected: true })
      await get().fetchCalendarEvents()
    } catch (e) {
      console.error("[Zustand.connectGoogleCalendar] failed:", e)
      throw e
    } finally {
      set({ isConnectingCalendar: false })
    }
  },

  disconnectGoogleCalendar: async () => {
    calendarService.disconnect()
    set({ isCalendarConnected: false, calendarEvents: [] })
    await get().fetchTasks()
  },

  fetchCalendarEvents: async () => {
    try {
      const gcalEvents = await calendarService.getEvents()
      set({ calendarEvents: gcalEvents })
    } catch (e) {
      console.error("[Zustand.fetchCalendarEvents] failed:", e)
    }
  }
}))
