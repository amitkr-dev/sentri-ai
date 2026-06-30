const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Helper to determine if an API key is a valid Gemini Developer key
const isValidApiKey = (key) => {
  return key && typeof key === 'string' && key.trim().length > 10 && !key.startsWith("mock_");
};

// POST chat prompt response
router.post("/chat", async (req, res) => {
  try {
    const { query, tasks, calendarEvents, apiKey } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    // Resolve API Key: prioritize request header, then request body, then environment variables
    const headerKey = req.headers["x-gemini-api-key"];
    const finalApiKey = headerKey || apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!isValidApiKey(finalApiKey)) {
      // Fallback Mock processor if no key is configured
      const lower = query.toLowerCase();
      let responseText = "";
      let isRescueTrigger = false;

      if (lower.includes("risk") || lower.includes("dangerous") || lower.includes("riskiest")) {
        responseText = "Based on my current risk audits, your riskiest task is **Stripe API Webhook migration** at **85% risk**. This is due to a calendar overlap tomorrow morning. I recommend running calendar Rescue Mode to protect focus blocks.";
      } else if (lower.includes("rescue") || lower.includes("calendar rescue")) {
        responseText = "Executing calendar optimization simulations... I have checked your sync schedules. declination notes have been drafted for Standup Sync. Protected focus blocks successfully synced.";
        isRescueTrigger = true;
      } else if (lower.startsWith("add ") || lower.includes("add task")) {
        const title = query.replace(/^add\s+task\s+/i, '').replace(/^add\s+/i, '').trim();
        responseText = `DONE_TASK: ${title}\nI've created the task **"${title}"** and added it to your queue. Estimated risk is currently 50%.`;
      } else {
        responseText = `I received your command: "${query}". I can optimize calendars, trigger Rescue Mode blocks, or analyze risk indices. Try clicking one of the suggested tags below.`;
      }

      // Append notice explaining mock mode
      responseText += "\n\n*(Notice: Running in Mock AI Mode. Add a valid VITE_GEMINI_API_KEY in Settings/Profile to connect live Gemini AI)*";

      return res.json({
        sender: "sentri",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rescueNode: isRescueTrigger
      });
    }

    // Call real Gemini API
    const genAI = new GoogleGenerativeAI(finalApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Setup prompt with context
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

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    const isRescueTrigger = responseText.includes("TRIGGER_RESCUE") || query.toLowerCase().includes("rescue");

    res.json({
      sender: "sentri",
      text: responseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rescueNode: isRescueTrigger
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI response: " + error.message });
  }
});

module.exports = router;
