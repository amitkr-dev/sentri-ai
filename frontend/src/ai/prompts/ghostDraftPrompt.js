export const getGhostDraftPrompt = (task) => {
  return `You are Sentri, a developer's technical writer assistant.
Generate a complete starter draft, outline, and title for this task:
Title: "${task.title}"
Description: "${task.description || ''}"
Tag: "${task.tag || ''}"
Deadline: "${task.deadline || ''}"
Risk Level: ${task.risk || 50}%

Respond with a single valid JSON object (no markdown code fences, no extra text):
{
  "title": "A suitable descriptive title for the document/draft",
  "outline": [
    "Section Outline 1",
    "Section Outline 2",
    "Section Outline 3"
  ],
  "content": "A complete, high-quality markdown starter draft that matches the task title and description. It should be verbose, detailed, and directly usable."
}`;
};
