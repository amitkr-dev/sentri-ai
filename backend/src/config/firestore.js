const admin = require("firebase-admin");

class MockDoc {
  constructor(collectionName, docId, dataRef) {
    this.collectionName = collectionName;
    this.docId = docId;
    this.dataRef = dataRef;
  }
  async get() {
    const docData = this.dataRef[this.collectionName]?.[this.docId];
    return {
      exists: !!docData,
      data: () => docData
    };
  }
  async set(data) {
    if (!this.dataRef[this.collectionName]) this.dataRef[this.collectionName] = {};
    this.dataRef[this.collectionName][this.docId] = data;
  }
  async update(updates) {
    if (!this.dataRef[this.collectionName]) this.dataRef[this.collectionName] = {};
    const existing = this.dataRef[this.collectionName][this.docId] || {};
    this.dataRef[this.collectionName][this.docId] = { ...existing, ...updates };
  }
  async delete() {
    if (this.dataRef[this.collectionName]) {
      delete this.dataRef[this.collectionName][this.docId];
    }
  }
}

class MockCollection {
  constructor(collectionName, dataRef) {
    this.collectionName = collectionName;
    this.dataRef = dataRef;
  }
  limit() {
    return this;
  }
  doc(docId) {
    return new MockDoc(this.collectionName, docId, this.dataRef);
  }
  async get() {
    const colData = this.dataRef[this.collectionName] || {};
    const docs = Object.keys(colData).map(id => {
      const docData = colData[id];
      return {
        id,
        exists: true,
        data: () => docData
      };
    });
    return {
      empty: docs.length === 0,
      forEach: (callback) => docs.forEach(callback),
      docs
    };
  }
  async add(data) {
    const docId = 'auto_' + Math.random().toString(36).substring(2);
    const docRef = this.doc(docId);
    await docRef.set({ ...data, id: docId });
    return docRef;
  }
}

class MockDb {
  constructor() {
    this.data = {};
  }
  collection(name) {
    return new MockCollection(name, this.data);
  }
}

let db;
let isFirebaseConnected = false;

// Check if Firebase service account credentials or project configs are present
const hasFirebaseConfig = process.env.FIREBASE_CONFIG || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.VITE_FIREBASE_PROJECT_ID;

if (hasFirebaseConfig) {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    db = admin.firestore();
    isFirebaseConnected = true;
    console.log("[DEBUG] Backend Database: Successfully connected to Google Cloud Firestore.");
  } catch (e) {
    console.warn("[WARNING] Failed to initialize Firebase Admin SDK. Falling back to Mock Database:", e.message);
  }
}

if (!isFirebaseConnected) {
  console.log("[DEBUG] Backend Database: No Firebase configuration found. Running with in-memory Mock Database.");
  db = new MockDb();
}

// Pre-populates database collections with starting dashboard data if empty
async function initializeDefaultData() {
  // 1. Tasks pre-population
  const tasksRef = db.collection("tasks");
  const tasksSnapshot = await tasksRef.limit(1).get();
  if (tasksSnapshot.empty) {
    const defaultTasks = [
      { id: "t1", title: "Hackathon Submission", tag: "Design", status: "in_progress", risk: 91, deadline: "Tomorrow, 11:59 PM", aiManaged: true, reason: "Busy calendar this afternoon + scope underestimated by ~35%", subtasks: { done: 2, total: 5 } },
      { id: "t2", title: "API Integration", tag: "Dev", status: "in_progress", risk: 78, deadline: "Tuesday, 6:00 PM", aiManaged: true, reason: "2 unresolved dependencies blocking progress for 2 days", subtasks: { done: 1, total: 4 } },
      { id: "t3", title: "Data Analysis Report", tag: "School", status: "todo", risk: 55, deadline: "Thursday, 5:00 PM", aiManaged: false, reason: "Moderate scope, no focus block scheduled yet", subtasks: { done: 0, total: 6 } },
      { id: "t4", title: "Resume Review", tag: "Career", status: "todo", risk: 34, deadline: "Wednesday, 12:00 PM", aiManaged: false, reason: "Light scope, ample time remaining", subtasks: { done: 0, total: 2 } },
      { id: "t5", title: "Client Demo Prep", tag: "Writing", status: "todo", risk: 48, deadline: "Friday, 3:00 PM", aiManaged: false, reason: "Some calendar conflicts detected next week", subtasks: { done: 0, total: 3 } },
      { id: "t6", title: "Literature Review Draft", tag: "Research", status: "todo", risk: 21, deadline: "Next Monday", aiManaged: false, reason: "Plenty of runway, low complexity", subtasks: { done: 0, total: 4 } },
      { id: "t7", title: "Q3 Report Draft", tag: "Writing", status: "done", risk: 12, deadline: "Completed yesterday", aiManaged: true, reason: "Ghost draft compiled - finished 40 min early", subtasks: { done: 5, total: 5 } },
      { id: "t8", title: "Onboarding Flow Wireframes", tag: "Design", status: "done", risk: 8, deadline: "Completed 3 days ago", aiManaged: false, reason: "Finished comfortably ahead of schedule", subtasks: { done: 4, total: 4 } }
    ];
    for (const t of defaultTasks) {
      await tasksRef.doc(t.id).set(t);
    }
  }

  // 2. Calendar Events pre-population
  const calendarRef = db.collection("calendarEvents");
  const calendarSnapshot = await calendarRef.limit(1).get();
  if (calendarSnapshot.empty) {
    const defaultEvents = [
      { id: "evt_1", title: "Team standup", source: "calendar", start: 9, end: 9.5, googleEventId: "gcal_abc123" },
      { id: "evt_2", title: "Hackathon submission — deep work", source: "ai_focus", start: 10, end: 12, reason: "Highest risk task (91%). Scheduled in your most productive window." },
      { id: "evt_3", title: "Client call", source: "calendar", start: 13, end: 14, googleEventId: "gcal_def456" },
      { id: "evt_4", title: "Rescue plan: Q3 Report", source: "rescue", start: 14.5, end: 16, reason: "Recovery block generated after risk score crossed 70%." },
      { id: "evt_5", title: "Gym", source: "calendar", start: 18, end: 19, googleEventId: "gcal_ghi789" }
    ];
    for (const ev of defaultEvents) {
      await calendarRef.doc(ev.id).set(ev);
    }
  }

  // 3. Notifications pre-population
  const notificationsRef = db.collection("notifications");
  const notificationsSnapshot = await notificationsRef.limit(1).get();
  if (notificationsSnapshot.empty) {
    const defaultNotifications = [
      { id: "n1", category: "critical", title: "Calendar Conflict Detected", text: "Your 'Hackathon Submission' (Risk: 91%) overlaps with tomorrow's standup sync at 9:00 AM.", time: "2 hours ago", read: false, actionLabel: "Approve Focus Reschedule", resolved: false },
      { id: "n2", category: "warning", title: "High Risk Alert: API Integration", text: "Task risk has crossed 75% due to 2 unresolved database migration blocks.", time: "4 hours ago", read: false, actionLabel: "Audit Risk Signals", resolved: false },
      { id: "n3", category: "info", title: "Autopilot Day Review", text: "Sentri completed morning calendar defense: declined 1 non-essential meeting and secured a 3-hour focus block.", time: "1 day ago", read: true, actionLabel: "View Calendar Changes", resolved: false },
      { id: "n4", category: "info", title: "Ghost Draft Completed", text: "Autonomous draft compilation for 'Q3 Report Draft' has completed successfully.", time: "3 days ago", read: true, actionLabel: "", resolved: false }
    ];
    for (const notif of defaultNotifications) {
      await notificationsRef.doc(notif.id).set(notif);
    }
  }

  // 4. Settings pre-population
  const settingsRef = db.collection("settings");
  const settingsSnapshot = await settingsRef.doc("default").get();
  if (!settingsSnapshot.exists) {
    await settingsRef.doc("default").set({
      autopilotLevel: "standard",
      slackConnected: true,
      githubConnected: false,
      allowAutoDeclines: true,
      notifyBeforeReschedule: false
    });
  }
}

module.exports = {
  db,
  initializeDefaultData
};
