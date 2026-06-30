export const getMorningBriefPrompt = (tasks) => {
  const tasksSummary = tasks
    .filter(t => t.status !== 'done')
    .map(t => `- [${t.tag}] ${t.title} (Risk: ${t.risk}%, Deadline: ${t.deadline})`)
    .join('\n');

  return `You are Sentri, a calendar defense AI assistant.
Analyze these tasks for today:
${tasksSummary}

Generate a morning briefing.
Respond with a single JSON object (no markdown code fences, no extra text):
{
  "summary": "1-2 sentence encouraging overview of the day's tasks",
  "focusTask": "The title of the most critical high-risk task to handle first",
  "scheduleAdvice": "One piece of scheduling advice to protect delivery runways"
}`;
};
