export const TAGS = ['Design', 'Dev', 'Career', 'School', 'Writing', 'Research']

export const STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

export const STATUS_META = {
  [STATUS.TODO]:        { label: 'To Do',       color: '#71717a' },
  [STATUS.IN_PROGRESS]: { label: 'In Progress', color: '#6366f1' },
  [STATUS.DONE]:        { label: 'Done',        color: '#22c55e' },
}

export function riskTier(risk) {
  if (risk >= 75) return { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  if (risk >= 50) return { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return            { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
}

export const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Hackathon Submission',
    tag: 'Design',
    status: STATUS.IN_PROGRESS,
    risk: 91,
    deadline: 'Tomorrow, 11:59 PM',
    deadlineSort: 1,
    aiManaged: true,
    reason: 'Busy calendar this afternoon + scope underestimated by ~35%',
    subtasks: { done: 2, total: 5 },
  },
  {
    id: 't2',
    title: 'API Integration',
    tag: 'Dev',
    status: STATUS.IN_PROGRESS,
    risk: 78,
    deadline: 'Tuesday, 6:00 PM',
    deadlineSort: 2,
    aiManaged: true,
    reason: '2 unresolved dependencies blocking progress for 2 days',
    subtasks: { done: 1, total: 4 },
  },
  {
    id: 't3',
    title: 'Data Analysis Report',
    tag: 'School',
    status: STATUS.TODO,
    risk: 55,
    deadline: 'Thursday, 5:00 PM',
    deadlineSort: 4,
    aiManaged: false,
    reason: 'Moderate scope, no focus block scheduled yet',
    subtasks: { done: 0, total: 6 },
  },
  {
    id: 't4',
    title: 'Resume Review',
    tag: 'Career',
    status: STATUS.TODO,
    risk: 34,
    deadline: 'Wednesday, 12:00 PM',
    deadlineSort: 3,
    aiManaged: false,
    reason: 'Light scope, ample time remaining',
    subtasks: { done: 0, total: 2 },
  },
  {
    id: 't5',
    title: 'Client Demo Prep',
    tag: 'Writing',
    status: STATUS.TODO,
    risk: 48,
    deadline: 'Friday, 3:00 PM',
    deadlineSort: 5,
    aiManaged: false,
    reason: 'Some calendar conflicts detected next week',
    subtasks: { done: 0, total: 3 },
  },
  {
    id: 't6',
    title: 'Literature Review Draft',
    tag: 'Research',
    status: STATUS.TODO,
    risk: 21,
    deadline: 'Next Monday',
    deadlineSort: 8,
    aiManaged: false,
    reason: 'Plenty of runway, low complexity',
    subtasks: { done: 0, total: 4 },
  },
  {
    id: 't7',
    title: 'Q3 Report Draft',
    tag: 'Writing',
    status: STATUS.DONE,
    risk: 12,
    deadline: 'Completed yesterday',
    deadlineSort: 0,
    aiManaged: true,
    reason: 'Ghost draft accepted — finished 40 min early',
    subtasks: { done: 5, total: 5 },
  },
  {
    id: 't8',
    title: 'Onboarding Flow Wireframes',
    tag: 'Design',
    status: STATUS.DONE,
    risk: 8,
    deadline: 'Completed 3 days ago',
    deadlineSort: 0,
    aiManaged: false,
    reason: 'Finished comfortably ahead of schedule',
    subtasks: { done: 4, total: 4 },
  },
]
