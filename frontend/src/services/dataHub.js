import { db } from '../firebase/config'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

// Default productive templates initialized on first load
const DEFAULT_TASKS = [
  { id: 't1', title: 'Stripe API Webhook migration', tag: 'Dev', status: 'in_progress', risk: 85, deadline: 'Tomorrow, 5:00 PM', aiManaged: true, reason: 'High calendar density this afternoon limits code time', subtasks: { done: 2, total: 5 } },
  { id: 't2', title: 'Prepare board performance report', tag: 'Writing', status: 'in_progress', risk: 62, deadline: 'Wednesday, 2:00 PM', aiManaged: false, reason: 'Pending dependencies from finance deck', subtasks: { done: 1, total: 3 } },
  { id: 't3', title: 'Audit quarterly infrastructure cost', tag: 'Dev', status: 'todo', risk: 45, deadline: 'Friday, 6:00 PM', aiManaged: true, reason: 'Scope estimates match typical velocity bounds', subtasks: { done: 0, total: 4 } },
  { id: 't4', title: 'Setup Google Calendar sync API keys', tag: 'Research', status: 'todo', risk: 20, deadline: 'Next Monday', aiManaged: false, reason: 'Ample runway remaining, low sync load', subtasks: { done: 0, total: 2 } }
]

const DEFAULT_EVENTS = [
  { id: 'evt_1', title: 'Team standup sync', source: 'calendar', start: 9, end: 9.5, googleEventId: 'gcal_standup' },
  { id: 'evt_2', title: 'Webhook architecture review', source: 'calendar', start: 11.5, end: 12.5, googleEventId: 'gcal_arch' },
  { id: 'evt_3', title: 'Deep Work: Webhook Migration', source: 'ai_focus', start: 13, end: 16.5, reason: 'Locked focus block protected autonomously by Sentri' }
]

const DEFAULT_NOTIFICATIONS = [
  { id: 'n1', category: 'critical', title: 'Overlapping focus block conflict', text: "Your 'Webhook migration' focus slot overlaps with standup sync tomorrow.", time: '10 min ago', read: false, actionLabel: 'Approve Focus Reschedule', resolved: false },
  { id: 'n2', category: 'warning', title: 'Stripe API risk threshold warning', text: "Task risk crossed 75% due to 2 unresolved blocking PRs.", time: '1 hour ago', read: false, actionLabel: 'Audit Risk Signals', resolved: false }
]

const DEFAULT_SETTINGS = {
  autopilotLevel: 'standard',
  slackConnected: true,
  githubConnected: false,
  allowAutoDeclines: true,
  notifyBeforeReschedule: false
}

// Check if Firebase is active (skip if running in local mock project mode)
const isFirebaseActive = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  return db && projectId && !projectId.includes('mock') && projectId !== 'sentri-ai'
}

// Local storage helpers
const getLocal = (key, fallback) => {
  const val = localStorage.getItem(key)
  if (!val) {
    localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }
  return JSON.parse(val)
}

const setLocal = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val))
}

export const dataHub = {
  // --- TASKS ---
  async getTasks() {
    if (isFirebaseActive()) {
      try {
        const snap = await getDocs(collection(db, 'tasks'))
        const list = []
        snap.forEach(doc => list.push(doc.data()))
        if (list.length > 0) return list
      } catch (e) {
        console.warn("Firestore fetch failed, falling back to local storage", e)
      }
    }
    return getLocal('sentri_tasks', DEFAULT_TASKS)
  },

  async saveTask(task) {
    if (isFirebaseActive()) {
      try {
        await setDoc(doc(db, 'tasks', task.id), task)
      } catch (e) {
        console.warn("Firestore write failed, using local storage", e)
      }
    }
    const list = getLocal('sentri_tasks', DEFAULT_TASKS)
    const idx = list.findIndex(t => t.id === task.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...task }
    } else {
      list.push(task)
    }
    setLocal('sentri_tasks', list)
    return task
  },

  async deleteTask(id) {
    if (isFirebaseActive()) {
      try {
        await deleteDoc(doc(db, 'tasks', id))
      } catch (e) {
        console.warn("Firestore delete failed, using local storage", e)
      }
    }
    const list = getLocal('sentri_tasks', DEFAULT_TASKS)
    const filtered = list.filter(t => t.id !== id)
    setLocal('sentri_tasks', filtered)
  },

  // --- CALENDAR EVENTS ---
  async getCalendarEvents() {
    if (isFirebaseActive()) {
      try {
        const snap = await getDocs(collection(db, 'calendarEvents'))
        const list = []
        snap.forEach(doc => list.push(doc.data()))
        if (list.length > 0) return list
      } catch (e) {
        console.warn("Firestore calendar fetch failed", e)
      }
    }
    return getLocal('sentri_calendar', DEFAULT_EVENTS)
  },

  async saveCalendarEvent(ev) {
    if (isFirebaseActive()) {
      try {
        await setDoc(doc(db, 'calendarEvents', ev.id), ev)
      } catch (e) {
        console.warn("Firestore write failed", e)
      }
    }
    const list = getLocal('sentri_calendar', DEFAULT_EVENTS)
    const idx = list.findIndex(e => e.id === ev.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...ev }
    } else {
      list.push(ev)
    }
    setLocal('sentri_calendar', list)
    return ev
  },

  async deleteCalendarEvent(id) {
    if (isFirebaseActive()) {
      try {
        await deleteDoc(doc(db, 'calendarEvents', id))
      } catch (e) {
        console.warn("Firestore delete failed", e)
      }
    }
    const list = getLocal('sentri_calendar', DEFAULT_EVENTS)
    const filtered = list.filter(e => e.id !== id)
    setLocal('sentri_calendar', filtered)
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    if (isFirebaseActive()) {
      try {
        const snap = await getDocs(collection(db, 'notifications'))
        const list = []
        snap.forEach(doc => list.push(doc.data()))
        if (list.length > 0) return list
      } catch (e) {
        console.warn("Firestore notifications fetch failed", e)
      }
    }
    return getLocal('sentri_notifications', DEFAULT_NOTIFICATIONS)
  },

  async saveNotification(notif) {
    if (isFirebaseActive()) {
      try {
        await setDoc(doc(db, 'notifications', notif.id), notif)
      } catch (e) {
        console.warn("Firestore write failed", e)
      }
    }
    const list = getLocal('sentri_notifications', DEFAULT_NOTIFICATIONS)
    const idx = list.findIndex(n => n.id === notif.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...notif }
    } else {
      list.push(notif)
    }
    setLocal('sentri_notifications', list)
    return notif
  },

  async deleteNotification(id) {
    if (isFirebaseActive()) {
      try {
        await deleteDoc(doc(db, 'notifications', id))
      } catch (e) {
        console.warn("Firestore delete failed", e)
      }
    }
    const list = getLocal('sentri_notifications', DEFAULT_NOTIFICATIONS)
    const filtered = list.filter(n => n.id !== id)
    setLocal('sentri_notifications', filtered)
  },

  // --- SETTINGS ---
  async getSettings() {
    if (isFirebaseActive()) {
      try {
        const snap = await getDocs(collection(db, 'settings'))
        const list = []
        snap.forEach(doc => list.push(doc.data()))
        const found = list.find(s => s.id === 'default')
        if (found) return found
      } catch (e) {
        console.warn("Firestore settings fetch failed", e)
      }
    }
    return getLocal('sentri_settings', DEFAULT_SETTINGS)
  },

  async saveSettings(settings) {
    if (isFirebaseActive()) {
      try {
        await setDoc(doc(db, 'settings', 'default'), settings)
      } catch (e) {
        console.warn("Firestore settings save failed", e)
      }
    }
    setLocal('sentri_settings', settings)
    return settings
  }
}
