export const queryGemini = async (query, tasks, calendarEvents) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isRealKey = apiKey && apiKey.trim().length > 10 && !apiKey.startsWith("mock_");

  if (!isRealKey) {
    const lower = query.toLowerCase();
    let text = "";
    let isRescue = false;
    
    if (lower.includes("risk") || lower.includes("dangerous") || lower.includes("riskiest")) {
      const active = tasks.filter(t => t.status !== 'done').sort((a, b) => b.risk - a.risk);
      if (active.length > 0) {
        text = `Based on your live task list, your riskiest active task is **"${active[0].title}"** with a **${active[0].risk}% probability** of missing its deadline.\n\nSuggested mitigation: Launch Calendar Rescue Mode to decline overlapping meetings and carve out focus buffers.`;
      } else {
        text = "All tasks are cleared! You currently have zero risk profile alerts.";
      }
    } else if (lower.includes("rescue") || lower.includes("calendar rescue")) {
      text = "Executing calendar optimization simulations... I have checked your sync schedules. declination notes have been drafted for Standup Sync. Protected focus blocks successfully synced. Active schedule risk mitigated!";
      isRescue = true;
    } else if (lower.startsWith("add ") || lower.includes("add task")) {
      const title = query.replace(/^add\s+task\s+/i, '').replace(/^add\s+/i, '').trim();
      text = `DONE_TASK: ${title}\nI have created the task **"${title}"** and added it to your queue.`;
    } else {
      text = `I received your command: "${query}". I can optimize calendars, trigger Rescue Mode blocks, or analyze risk indices. Try clicking one of the suggested tags below.`;
    }
    
    text += "\n\n*(Notice: Running in Mock AI Mode. Set a valid VITE_GEMINI_API_KEY in .env.local to connect live Gemini AI)*";
    return { text, isRescue };
  }

  // Real Gemini Key is present!
  const systemPrompt = `You are Sentri, a calendar defense and task risk prediction AI assistant for developers.
You help protect their delivery runways from meeting density issues.
Current Date/Time context: 2026-06-30.

Current Active Tasks:
${JSON.stringify(tasks || [], null, 2)}

Current Calendar Schedule:
${JSON.stringify(calendarEvents || [], null, 2)}

Instructions:
1. If the user asks to add/create a task, reply starting with:
"DONE_TASK: [exact task title]" followed by confirmation, so the client-side system can intercept and save it.
2. If the user asks to "trigger calendar rescue" or clear schedule conflicts, reply starting with:
"TRIGGER_RESCUE" followed by details, so the client-side system can lock focus blocks.
3. Be professional, direct, and helpful. Keep responses concise and formatted in clean markdown.

User Message: "${query}"`;

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/sentri-ai/us-central1/api/copilot/chat";
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-api-key": apiKey
      },
      body: JSON.stringify({ query, tasks, calendarEvents })
    });
    
    if (res.ok) {
      const data = await res.json();
      return {
        text: data.text,
        isRescue: !!data.rescueNode
      };
    }
  } catch (error) {
    console.warn("Backend API functions offline. Querying Google Generative Language API directly...", error);
  }

  // 2. Direct browser fetch fallback to Google API
  try {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(directUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";
    const isRescue = rawText.includes("TRIGGER_RESCUE") || query.toLowerCase().includes("rescue");

    return {
      text: rawText,
      isRescue
    };
  } catch (error) {
    console.error("Direct Gemini query failed:", error);
    return {
      text: `Gemini API Error: ${error.message}\n\nPlease check that your VITE_GEMINI_API_KEY is correct.`,
      isRescue: false
    };
  }
};

export const queryGeminiForTaskAnalysis = async (title, description, currentRisk, deadline, tag) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isRealKey = apiKey && apiKey.trim().length > 10 && !apiKey.startsWith("mock_");

  if (!isRealKey) {
    console.warn("Using mock task analysis. Set a real VITE_GEMINI_API_KEY.");
    return {
      priority: currentRisk >= 75 ? "High" : currentRisk >= 40 ? "Medium" : "Low",
      risk: Number(currentRisk) || 50,
      productivityScore: Math.round(95 - (currentRisk * 0.4)),
      estimatedDuration: "2.5 hours",
      recommendedStartTime: "10:30 AM",
      reasoning: [
        "Identified context-switch risks with neighboring calendar events.",
        "Delivery buffer matches velocity benchmarks for dev tasks."
      ],
      nextAction: "Allocate focused deep work slots in calendar"
    };
  }

  const prompt = `You are Sentri, an agentic calendar assistant.
Analyze this newly created task:
Title: "${title}"
Description: "${description}"
Tag: "${tag}"
User-assigned Risk Estimate: ${currentRisk}%
Deadline: "${deadline}"

Produce an optimization risk profile. Evaluate dependencies, task complexity, and context.
You MUST respond with a single, valid JSON object matching the following structure and no other text:
{
  "priority": "High" | "Medium" | "Low",
  "risk": number (0-100, representing real deadline miss probability based on details),
  "productivityScore": number (0-100, representing expected focus efficiency score),
  "estimatedDuration": "X hours" or "X mins",
  "recommendedStartTime": "HH:MM AM/PM",
  "reasoning": ["reason 1", "reason 2"],
  "nextAction": "specific action item"
}`;

  try {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const res = await fetch(directUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google API returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText.trim());
  } catch (error) {
    console.error("Gemini task analysis failed, trying flash fallback:", error);
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(directUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.trim());
      }
    } catch (innerError) {
      console.error("Gemini fallback failed:", innerError);
    }
    return {
      priority: currentRisk >= 75 ? "High" : currentRisk >= 40 ? "Medium" : "Low",
      risk: Number(currentRisk) || 50,
      productivityScore: 78,
      estimatedDuration: "2 hours",
      recommendedStartTime: "11:00 AM",
      reasoning: ["Analysis failed due to API connection limits.", "Defaulting to manual estimates."],
      nextAction: "Verify calendar allocations manually."
    };
  }
};

export const generateAIInsightsFromTasks = async (tasks) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isRealKey = apiKey && apiKey.trim().length > 10 && !apiKey.startsWith("mock_");

  if (!isRealKey || !tasks || tasks.length === 0) {
    return [
      {
        type: 'warning',
        text: 'Your productivity drops significantly after 8 PM.',
        sub: 'Schedule critical work before then.',
        color: '#f59e0b',
      },
      {
        type: 'danger',
        text: 'You underestimate complex dev tasks by 35% on average.',
        sub: 'Add buffer time to deadline estimates.',
        color: '#ef4444',
      },
      {
        type: 'success',
        text: 'Tomorrow has enough focus time to finish the API task.',
        sub: '3.5 hrs of uninterrupted blocks available.',
        color: '#22c55e',
      }
    ];
  }

  const activeTasksSummary = tasks
    .filter(t => t.status !== 'done')
    .map(t => `- [${t.tag}] ${t.title} (Risk: ${t.risk}%, Deadline: ${t.deadline})`)
    .join('\n');

  const prompt = `You are Sentri, a calendar and task risk analysis AI.
Here is the user's current active task list:
${activeTasksSummary}

Analyze this workload and provide exactly 3 concise, highly actionable productivity insights.
For example, identify high-risk peaks, suggest grouping similar tasks, or point out deadline risks.
Respond with a single valid JSON array of exactly 3 objects and no other text:
[
  {
    "type": "warning" | "danger" | "success",
    "text": "The main dynamic insight statement here (concise, max 10 words)",
    "sub": "Actionable recommendation here (concise, max 8 words)",
    "color": "#f59e0b" | "#ef4444" | "#22c55e"
  }
]`;

  try {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const res = await fetch(directUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      throw new Error(`Google API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText.trim());
  } catch (error) {
    console.error("Gemini insights generation failed, trying flash fallback:", error);
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(directUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.trim());
      }
    } catch (innerErr) {
      console.error("Flash insights fallback failed:", innerErr);
    }
    return [
      {
        type: 'warning',
        text: 'Your productivity drops significantly after 8 PM.',
        sub: 'Schedule critical work before then.',
        color: '#f59e0b',
      },
      {
        type: 'danger',
        text: 'Reviewing tasks shows a rise in late-day context switching.',
        sub: 'Block focus slots for dev tasks.',
        color: '#ef4444',
      },
      {
        type: 'success',
        text: 'Workload is balanced across your priority tags.',
        sub: 'Keep up the steady sprint velocity.',
        color: '#22c55e',
      }
    ];
  }
};
