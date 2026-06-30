export const getExecutionPrompt = (task) => {
  return `You are Sentri, an AI execution assistant.
Generate a detailed execution plan and focus blocks for this high-risk task:
Title: "${task.title}"
Description: "${task.description || ''}"
Tag: "${task.tag || ''}"
Deadline: "${task.deadline || ''}"
Risk Level: ${task.risk}%

Respond with a single valid JSON object (no markdown code fences, no extra text):
{
  "estimatedHours": number,
  "executionPlan": [
    {
      "title": "Phase/Task Title",
      "duration": "duration text (e.g. 1 hour, 45 mins)",
      "priority": number (incremental starting from 1)
    }
  ],
  "focusBlocks": [
    {
      "start": "HH:MM",
      "end": "HH:MM"
    }
  ]
}`;
};
