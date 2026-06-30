export const getRiskPrompt = (task) => {
  return `You are Sentri, an AI deadline risk predictor.
Analyze this task:
Title: "${task.title}"
Description: "${task.description || ''}"
Tag: "${task.tag || ''}"
Deadline: "${task.deadline || ''}"
User Assigned Risk: ${task.risk || 50}%

Evaluate potential meeting conflicts, task complexity, tag category, and contextual blockers.
Predict the risk value, estimated hours, complexity, a short reason, risk-mitigation actions, a phased execution plan, and a ghost delay-notice draft.

Respond with a single valid JSON object (no markdown code fences, no extra text):
{
  "risk": number (0-100, representing real deadline miss probability based on task parameters),
  "estimatedHours": number,
  "complexity": "Low" | "Medium" | "High",
  "reason": "A concise one-sentence description of the primary risk source",
  "actions": ["Mitigation action 1", "Mitigation action 2"],
  "executionPlan": [
    {
      "phase": "Phase title (e.g. Phase 1: Planning)",
      "tasks": ["Execution subtask A", "Execution subtask B"]
    }
  ],
  "ghostDraft": {
    "subject": "Slack or email subject line",
    "message": "Polite delay-warning notification draft text"
  }
}`;
};
