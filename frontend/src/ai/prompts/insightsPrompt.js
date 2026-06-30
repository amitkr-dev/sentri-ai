export const getInsightsPrompt = (tasks) => {
  const tasksSummary = tasks
    .filter(t => t.status !== 'done')
    .map(t => `- [${t.tag}] ${t.title} (Risk: ${t.risk}%, Deadline: ${t.deadline})`)
    .join('\n');

  return `You are Sentri, a team calendar assistant.
Here is the active task list:
${tasksSummary}

Generate exactly 3 concise, actionable productivity insights.
Respond with a single JSON array of exactly 3 objects (no markdown code fences, no extra text):
[
  {
    "type": "warning" | "danger" | "success",
    "text": "The main dynamic insight statement here (max 10 words)",
    "sub": "Actionable recommendation here (max 8 words)",
    "color": "#f59e0b" | "#ef4444" | "#22c55e"
  }
]`;
};
