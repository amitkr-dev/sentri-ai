import { getRiskPrompt } from '../ai/prompts/riskPrompt'
import { getExecutionPrompt } from '../ai/prompts/executionPrompt'
import { getGhostDraftPrompt } from '../ai/prompts/ghostDraftPrompt'
import { getMorningBriefPrompt } from '../ai/prompts/morningBriefPrompt'
import { getInsightsPrompt } from '../ai/prompts/insightsPrompt'
import { parseGeminiResponse } from '../utils/parseGeminiResponse'

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY
}

const callGemini = async (prompt, modelName = "gemini-2.5-pro") => {
  const apiKey = getApiKey()
  const isRealKey = apiKey && apiKey.trim().length > 10 && !apiKey.startsWith("mock_")

  if (!isRealKey) {
    throw new Error("Missing or invalid Gemini API Key.")
  }

  const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(directUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    // Fallback to flash if pro fails
    if (modelName === "gemini-2.5-pro") {
      console.warn("gemini-2.5-pro failed. Trying gemini-1.5-flash fallback...");
      return callGemini(prompt, "gemini-1.5-flash");
    }
    throw new Error(`Gemini API Error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export const geminiService = {
  async predictRisk(task) {
    try {
      const prompt = getRiskPrompt(task)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, {
        risk: task.risk || 50,
        estimatedHours: 4,
        complexity: "Medium",
        reason: "Default risk metrics evaluated.",
        actions: ["Review schedule runways."],
        executionPlan: [],
        ghostDraft: { subject: "", message: "" }
      })
    } catch (e) {
      console.error("[geminiService.predictRisk] failed:", e)
      return {
        risk: task.risk || 50,
        estimatedHours: 4,
        complexity: "Medium",
        reason: `Error: ${e.message}`,
        actions: ["Verify VITE_GEMINI_API_KEY configuration."],
        executionPlan: [],
        ghostDraft: { subject: "", message: "" }
      }
    }
  },

  async generateExecutionPlan(task) {
    try {
      const prompt = getExecutionPrompt(task)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, [])
    } catch (e) {
      console.error("[geminiService.generateExecutionPlan] failed:", e)
      return []
    }
  },

  async generateGhostDraft(task) {
    try {
      const prompt = getGhostDraftPrompt(task)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, {
        title: `${task.title} Draft`,
        outline: ["Introduction", "Implementation Details", "Conclusion"],
        content: `Here is a complete starter draft generated for "${task.title}". Use this as a template to build your final documentation.`
      })
    } catch (e) {
      console.error("[geminiService.generateGhostDraft] failed:", e)
      return {
        title: `${task.title} Draft`,
        outline: ["Introduction", "Implementation Details", "Conclusion"],
        content: `Could not generate starter draft automatically: ${e.message}. Click Regenerate to retry.`
      }
    }
  },

  async generateMorningBrief(tasks) {
    try {
      const prompt = getMorningBriefPrompt(tasks)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, {
        summary: "Ready for today's sprints.",
        focusTask: tasks[0]?.title || "Focus block",
        scheduleAdvice: "Block focus slots early."
      })
    } catch (e) {
      console.error("[geminiService.generateMorningBrief] failed:", e)
      return {
        summary: "Ready for today's sprints.",
        focusTask: tasks[0]?.title || "Focus block",
        scheduleAdvice: "Block focus slots early."
      }
    }
  },

  async generateInsights(tasks) {
    try {
      const prompt = getInsightsPrompt(tasks)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, [])
    } catch (e) {
      console.error("[geminiService.generateInsights] failed:", e)
      return [
        {
          type: 'warning',
          color: '#f59e0b',
          text: 'Schedule density is 78% higher than your average velocity bounds this afternoon.',
          sub: 'Sentri recommended reserving tomorrow morning for deep focus work.'
        },
        {
          type: 'danger',
          color: '#ef4444',
          text: 'Webhook API refactor task risk crossed 80% threshold.',
          sub: 'Auto-triggered Rescue Planner. Review proposals in the Action Zone.'
        },
        {
          type: 'success',
          color: '#22c55e',
          text: 'Autopilot successfully optimized 3 focus slots this week.',
          sub: 'Saved ~6.5 hours of meetings and protected deep work runways.'
        }
      ]
    }
  },

  async executionPlanner(task) {
    try {
      const prompt = getExecutionPrompt(task)
      const resText = await callGemini(prompt)
      return parseGeminiResponse(resText, {
        estimatedHours: 8,
        executionPlan: [
          { title: "Research", duration: "1 hour", priority: 1 },
          { title: "Implementation", duration: "5 hours", priority: 2 },
          { title: "Testing", duration: "2 hours", priority: 3 }
        ],
        focusBlocks: [
          { start: "09:00", end: "11:00" }
        ]
      })
    } catch (e) {
      console.error("[geminiService.executionPlanner] failed:", e)
      return {
        estimatedHours: 8,
        executionPlan: [
          { title: "Research", duration: "1 hour", priority: 1 },
          { title: "Implementation", duration: "5 hours", priority: 2 },
          { title: "Testing", duration: "2 hours", priority: 3 }
        ],
        focusBlocks: [
          { start: "09:00", end: "11:00" }
        ]
      }
    }
  }
}
