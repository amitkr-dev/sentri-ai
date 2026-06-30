// Sentri AI - Service module: task.service.js
import { db, auth } from '../firebase/config'
import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, 
  query, where, addDoc 
} from 'firebase/firestore'

const DEFAULT_TASKS = [
  { id: 't1', title: 'Stripe API Webhook migration', tag: 'Dev', status: 'in_progress', risk: 85, deadline: 'Tomorrow, 5:00 PM', aiManaged: true, reason: 'High calendar density this afternoon limits code time', subtasks: { done: 2, total: 5 }, userId: 'mock-user-123' },
  { id: 't2', title: 'Prepare board performance report', tag: 'Writing', status: 'in_progress', risk: 62, deadline: 'Wednesday, 2:00 PM', aiManaged: false, reason: 'Pending dependencies from finance deck', subtasks: { done: 1, total: 3 }, userId: 'mock-user-123' },
  { id: 't3', title: 'Audit quarterly infrastructure cost', tag: 'Dev', status: 'todo', risk: 45, deadline: 'Friday, 6:00 PM', aiManaged: true, reason: 'Scope estimates match typical velocity bounds', subtasks: { done: 0, total: 4 }, userId: 'mock-user-123' },
  { id: 't4', title: 'Setup Google Calendar sync API keys', tag: 'Research', status: 'todo', risk: 20, deadline: 'Next Monday', aiManaged: false, reason: 'Ample runway remaining, low sync load', subtasks: { done: 0, total: 2 }, userId: 'mock-user-123' }
]

const isFirestoreActive = () => !!db && !!auth?.currentUser?.uid

const getUserId = () => {
  if (isFirestoreActive()) {
    return auth.currentUser.uid
  }
  return 'mock-user-123'
}

// Local storage helper functions
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

export const taskService = {
  async seedUserDatabase(userId) {
    if (!isFirestoreActive()) return

    // 1. Seed default tasks
    const qTasks = query(collection(db, 'tasks'), where('userId', '==', userId))
    const taskSnap = await getDocs(qTasks)
    if (taskSnap.empty) {
      console.log("[DEBUG] Seeding default tasks for user:", userId)
      for (const t of DEFAULT_TASKS) {
        const uniqueId = `${t.id}_${userId}`
        const taskDoc = { 
          ...t, 
          id: uniqueId,
          userId, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        }
        await setDoc(doc(db, 'tasks', uniqueId), taskDoc)
      }
    }

    // 2. Seed default calendar events
    const qCalendar = query(collection(db, 'calendarEvents'), where('userId', '==', userId))
    const calSnap = await getDocs(qCalendar)
    if (calSnap.empty) {
      console.log("[DEBUG] Seeding default calendar events for user:", userId)
      const defaultEvents = [
        { id: 'evt_1', title: 'Daily Standup sync', source: 'calendar', start: 9, end: 10, reason: 'High calendar density this afternoon limits code time' },
        { id: 'evt_2', title: 'Refinement session', source: 'calendar', start: 14, end: 15 },
        { id: 'evt_3', title: 'Focus block: Stripe Webhooks', source: 'ai_focus', start: 10.5, end: 12.5 }
      ]
      for (const e of defaultEvents) {
        const uniqueId = `${e.id}_${userId}`
        const eventDoc = {
          ...e,
          id: uniqueId,
          userId,
          createdAt: new Date().toISOString()
        }
        await setDoc(doc(db, 'calendarEvents', uniqueId), eventDoc)
      }
    }

    // 3. Seed default settings
    const settingsDoc = doc(db, 'settings', userId)
    const settingsSnap = await getDoc(settingsDoc)
    if (!settingsSnap.exists()) {
      console.log("[DEBUG] Seeding default settings for user:", userId)
      await setDoc(settingsDoc, {
        autopilotLevel: 'standard',
        slackConnected: true,
        githubConnected: false,
        allowAutoDeclines: true,
        notifyBeforeReschedule: false,
        userId
      })
    }
  },

  async getTasks() {
    if (!isFirestoreActive()) {
      return getLocal('sentri_tasks', DEFAULT_TASKS)
    }
    try {
      const userId = getUserId()
      const q = query(collection(db, 'tasks'), where('userId', '==', userId))
      const snap = await getDocs(q)
      const list = []
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      return list
    } catch (e) {
      console.warn("Firestore task fetch failed, falling back to local storage", e)
      return getLocal('sentri_tasks', DEFAULT_TASKS)
    }
  },

  async getTask(id) {
    if (!isFirestoreActive()) {
      const list = getLocal('sentri_tasks', DEFAULT_TASKS)
      return list.find(t => t.id === id) || null
    }
    try {
      const snap = await getDoc(doc(db, 'tasks', id))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    } catch (e) {
      console.error("Firestore getTask failed", e)
      return null
    }
  },

  async createTask(task) {
    console.log("taskService.createTask() started with task:", task)
    const userId = getUserId()
    const id = task.id || 't_' + Date.now()
    const newTask = {
      ...task,
      id,
      userId,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString()
    }
    console.log("[DEBUG] Preparing document with userId:", userId)
    
    try {
      console.log("createActivityLog() started")
      await this.createActivityLog('Create Task', `Created task "${newTask.title}"`, 'check')
      console.log("createActivityLog() success")
    } catch (err) {
      console.error("createActivityLog() failed (continuing task):", err)
    }

    // Concurrent Gemini AI Analysis Flow
    let aiAnalysis = null
    let executionPlanData = null
    let ghostDraftData = null

    try {
      const { geminiService } = await import('./ai.service')
      const initialRisk = newTask.risk || 50
      const isWritingOrDoc = newTask.tag === 'Writing' || newTask.tag === 'Research' || /write|draft|document|prepare|report/i.test(newTask.title)
      
      const promises = []

      // 1. Predict risk (always run)
      promises.push(
        geminiService.predictRisk(newTask)
          .then(res => { aiAnalysis = res })
          .catch(err => console.error("Parallel risk prediction failed:", err))
      )

      // 2. Execution plan (if user specified high risk)
      if (initialRisk >= 70) {
        promises.push(
          geminiService.executionPlanner(newTask)
            .then(res => { executionPlanData = res })
            .catch(err => console.error("Parallel execution planner failed:", err))
        )
      }

      // 3. Ghost draft (if user specified high risk or it's a writing/doc task)
      if (initialRisk >= 70 || isWritingOrDoc) {
        promises.push(
          geminiService.generateGhostDraft(newTask)
            .then(res => { ghostDraftData = res })
            .catch(err => console.error("Parallel ghost draft failed:", err))
        )
      }

      console.log(`[DEBUG] Dispatching ${promises.length} Gemini analyses concurrently...`)
      await Promise.all(promises)

      // Secondary check: if AI risk is predicted high but user-defined risk wasn't, run execution & draft in phase 2
      const finalRisk = aiAnalysis ? Number(aiAnalysis.risk) : initialRisk
      const needsLatePlan = finalRisk >= 70 && !executionPlanData
      const needsLateDraft = (finalRisk >= 70 || isWritingOrDoc) && !ghostDraftData

      const secondaryPromises = []
      if (needsLatePlan) {
        secondaryPromises.push(
          geminiService.executionPlanner(newTask)
            .then(res => { executionPlanData = res })
            .catch(err => console.error("Secondary phase execution planner failed:", err))
        )
      }
      if (needsLateDraft) {
        secondaryPromises.push(
          geminiService.generateGhostDraft(newTask)
            .then(res => { ghostDraftData = res })
            .catch(err => console.error("Secondary phase ghost draft failed:", err))
        )
      }

      if (secondaryPromises.length > 0) {
        console.log(`[DEBUG] AI evaluation post-check: Running ${secondaryPromises.length} secondary Gemini queries concurrently...`)
        await Promise.all(secondaryPromises)
      }

    } catch (err) {
      console.error("[ERROR] Concurrent Gemini pipeline failed:", err)
    }

    const finalTaskWithExecution = {
      ...newTask,
      aiAnalysis,
      risk: aiAnalysis ? Number(aiAnalysis.risk) : (newTask.risk || 50),
      priority: aiAnalysis ? aiAnalysis.priority : (newTask.priority || 'Medium'),
      estimatedHours: aiAnalysis ? Number(aiAnalysis.estimatedHours) : 4,
      complexity: aiAnalysis ? aiAnalysis.complexity : 'Medium',
      reasoning: aiAnalysis && aiAnalysis.reason ? [
        `AI prediction: Estimated ${aiAnalysis.estimatedHours} hours`,
        aiAnalysis.reason
      ] : (newTask.reasoning || ['Analysis pending key configuration.']),
      actions: aiAnalysis ? aiAnalysis.actions : (newTask.actions || ['Review details.']),
      executionPlan: aiAnalysis ? aiAnalysis.executionPlan : (newTask.executionPlan || []),
      executionPlanData,
      ghostDraft: ghostDraftData || (aiAnalysis ? aiAnalysis.ghostDraft : { subject: '', message: '' })
    }

    if (!isFirestoreActive()) {
      console.log("[DEBUG] Firestore is not active, falling back to local storage")
      const list = getLocal('sentri_tasks', DEFAULT_TASKS)
      list.push(finalTaskWithExecution)
      setLocal('sentri_tasks', list)
      console.log("taskService.createTask() success")
      return finalTaskWithExecution
    }

    try {
      console.log("Firestore write started")
      await setDoc(doc(db, 'tasks', id), finalTaskWithExecution)

      // Generate a proposal document if the calculated risk is high (>= 75%)
      if (finalTaskWithExecution.risk >= 75) {
        const proposalId = `p_${id}`
        const proposalDoc = {
          id: proposalId,
          userId,
          taskId: id,
          task: finalTaskWithExecution.title,
          risk: finalTaskWithExecution.risk,
          reason: finalTaskWithExecution.reasoning.join(" + "),
          actions: (finalTaskWithExecution.actions || ["Reschedule overlapping syncs", "Decline meetings"]).map(act => ({ label: act })),
          deadline: finalTaskWithExecution.deadline,
          newRisk: Math.round(finalTaskWithExecution.risk * 0.25)
        }
        await setDoc(doc(db, 'proposals', proposalId), proposalDoc)
        console.log("[DEBUG] Proposal created in Firestore:", proposalId)
      }

      console.log("Firestore write success")
      console.log("taskService.createTask() success")
      return finalTaskWithExecution
    } catch (e) {
      console.error("Firestore error:", e)
      throw e
    }
  },

  async updateTask(id, updates) {
    const updated = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    if (!isFirestoreActive()) {
      const list = getLocal('sentri_tasks', DEFAULT_TASKS)
      const idx = list.findIndex(t => t.id === id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updated }
        setLocal('sentri_tasks', list)
      }
      return updated
    }
    try {
      await setDoc(doc(db, 'tasks', id), updated, { merge: true })
      return updated
    } catch (e) {
      console.error("Firestore updateTask failed", e)
      return updated
    }
  },

  async deleteTask(id) {
    if (!isFirestoreActive()) {
      const list = getLocal('sentri_tasks', DEFAULT_TASKS)
      const filtered = list.filter(t => t.id !== id)
      setLocal('sentri_tasks', filtered)
      return
    }
    try {
      await deleteDoc(doc(db, 'tasks', id))
    } catch (e) {
      console.error("Firestore deleteTask failed", e)
    }
  },

  async updateStatus(id, status) {
    const task = await this.getTask(id)
    const updates = { status }
    if (status === 'done') {
      updates.prevRisk = task?.risk || 50
      updates.risk = 0
      updates.deadline = 'Completed today'
    } else {
      updates.risk = task?.prevRisk || 50
    }
    
    await this.createActivityLog('Update Status', `Updated status of "${task?.title || id}" to ${status}`, 'check')
    return this.updateTask(id, updates)
  },

  async approveProposal(proposalId, taskId) {
    const userId = getUserId()
    await this.createActivityLog('Approve Proposal', `Approved proposal "${proposalId}" for calendar restructuring`, 'calendar')
    
    const focusId = `evt_p1_focus_${userId}`
    const targetId = `evt_1_${userId}`
    const newBlock = {
      id: focusId,
      userId,
      title: 'Deep Work: Webhook Migration',
      source: 'ai_focus',
      start: 9,
      end: 12.5,
      reason: 'Restructured autonomously after standup sync reschedule approved.'
    }

    if (isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'calendarEvents', focusId), newBlock)
        await deleteDoc(doc(db, 'calendarEvents', targetId))
        
        // Delete the proposal document in Firestore
        await deleteDoc(doc(db, 'proposals', proposalId))
      } catch (e) {
        console.warn("Firestore calendar save failed in approveProposal", e)
      }
    } else {
      const events = getLocal('sentri_calendar', [])
      events.push(newBlock)
      setLocal('sentri_calendar', events.filter(e => e.id !== 'evt_1'))
    }
    window.dispatchEvent(new Event('calendarUpdated'))
  },

  async activateRescue(taskId) {
    const userId = getUserId()
    const task = await this.getTask(taskId)
    await this.createActivityLog('Activate Rescue', `Activated Rescue Mode for "${task?.title || taskId}"`, 'zap')

    const updates = {
      risk: 24,
      reasoning: [
        'Sentri optimized calendar parameters successfully.',
        'Declined 2 secondary syncs.',
        'Created locked 5-hour focus block (11:00 AM - 4:05 PM).'
      ]
    }
    await this.updateTask(taskId, updates)

    const rescueId = `evt_rescue_${taskId}`
    const newBlock = {
      id: rescueId,
      userId,
      title: `Focus Block: ${task?.title || 'Task'}`,
      source: 'ai_focus',
      start: 11,
      end: 16,
      reason: 'Autopilot reallocated calendar space to secure focus blocks before deadline.'
    }
    
    if (isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'calendarEvents', rescueId), newBlock)
        await deleteDoc(doc(db, 'calendarEvents', `evt_1_${userId}`))
      } catch (e) {
        console.warn("Firestore calendar save failed in activateRescue", e)
      }
    } else {
      const events = getLocal('sentri_calendar', [])
      events.push(newBlock)
      setLocal('sentri_calendar', events.filter(e => e.id !== 'evt_1'))
    }
    window.dispatchEvent(new Event('calendarUpdated'))
  },

  async createActivityLog(action, details, iconType) {
    console.log("[DEBUG] Inside taskService.createActivityLog", { action, details, iconType })
    const userId = getUserId()
    const log = {
      userId,
      title: action,
      sub: details,
      iconType,
      createdAt: new Date().toISOString()
    }
    if (!isFirestoreActive()) {
      console.log("[DEBUG] db/auth is not active, logging activity locally")
      const logs = getLocal('sentri_activity_logs', [])
      logs.unshift(log)
      setLocal('sentri_activity_logs', logs.slice(0, 20))
      return log
    }
    try {
      console.log("[DEBUG] Calling Firestore addDoc for activity_logs")
      await addDoc(collection(db, 'activity_logs'), log)
      console.log("[DEBUG] Firestore success: activity log written")
      return log
    } catch (e) {
      console.error("[DEBUG] Firestore createActivityLog failed with error:", e)
      throw e
    }
  }
}

export default taskService
