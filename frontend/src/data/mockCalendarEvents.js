// Mock data shaped exactly like what Firestore + Google Calendar API would return.
// Replace fetchEventsForDate() with a real Firestore query + Calendar API call later —
// the component layer never needs to change.

export const EVENT_SOURCE = {
  CALENDAR: 'calendar',   // pulled from Google Calendar API
  AI_FOCUS: 'ai_focus',   // created autonomously by Sentri
  RESCUE: 'rescue',       // created by Rescue Mode
}

// hour values are 24h decimal (14.5 = 2:30pm) for simple vertical positioning
const TODAY_EVENTS = [
  {
    id: 'evt_1',
    title: 'Team standup',
    source: EVENT_SOURCE.CALENDAR,
    start: 9,
    end: 9.5,
    googleEventId: 'gcal_abc123',
  },
  {
    id: 'evt_2',
    title: 'Hackathon submission — deep work',
    source: EVENT_SOURCE.AI_FOCUS,
    start: 10,
    end: 12,
    reason: 'Highest risk task (91%). Scheduled in your most productive window.',
  },
  {
    id: 'evt_3',
    title: 'Client call',
    source: EVENT_SOURCE.CALENDAR,
    start: 13,
    end: 14,
    googleEventId: 'gcal_def456',
  },
  {
    id: 'evt_4',
    title: 'Rescue plan: Q3 Report',
    source: EVENT_SOURCE.RESCUE,
    start: 14.5,
    end: 16,
    reason: 'Recovery block generated after risk score crossed 70%.',
  },
  {
    id: 'evt_5',
    title: 'Gym',
    source: EVENT_SOURCE.CALENDAR,
    start: 18,
    end: 19,
    googleEventId: 'gcal_ghi789',
  },
]

export const RESTRUCTURE_DIFF = {
  triggeredBy: 'Client call moved from 11am to 1pm',
  summary: 'Sentri restructured your afternoon to protect focus time before your deadline.',
  changes: [
    { task: 'Hackathon submission — deep work', from: '1:00 PM', to: '10:00 AM', reason: 'Moved earlier to avoid the new client call conflict' },
    { task: 'Rescue plan: Q3 Report', from: '4:30 PM', to: '2:30 PM', reason: 'Shifted up to keep a buffer before gym' },
  ],
}

export function fetchEventsForDate(dateOffset = 0) {
  // dateOffset 0 = today. In production this calls Firestore (tasks/AI blocks)
  // merged with a Google Calendar API freebusy + events.list call.
  return new Promise((resolve) => {
    setTimeout(() => resolve(dateOffset === 0 ? TODAY_EVENTS : []), 400)
  })
}
