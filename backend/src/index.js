const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { initializeDefaultData, db } = require("./config/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  // Already initialized by firebase
}

const app = express();

// Configure CORS and parser
app.use(cors({ origin: true }));
app.use(express.json());

// Auto-seed Firestore collections on request if they are empty
app.use(async (req, res, next) => {
  try {
    await initializeDefaultData();
    next();
  } catch (error) {
    console.error("Auto-seeding Firestore database failed:", error);
    next();
  }
});

// Import routers
const tasksRouter = require("./tasks/tasksRouter");
const calendarRouter = require("./calendar/calendarRouter");
const notificationsRouter = require("./notifications/notificationsRouter");
const analyticsRouter = require("./analytics/analyticsRouter");
const geminiRouter = require("./gemini/geminiRouter");

// Mount routes
app.use("/tasks", tasksRouter);
app.use("/calendar", calendarRouter);
app.use("/notifications", notificationsRouter);
app.use("/analytics", analyticsRouter);
app.use("/copilot", geminiRouter);

app.get("/", (req, res) => {
  res.send("Sentri Backend API is online and running.");
});

// Export unified API
exports.api = functions.https.onRequest(app);

// Firestore Trigger: Automate risk prediction, reasoning, subtasks, and rescue plan generation
exports.onTaskCreated = functions.firestore
  .document("tasks/{taskId}")
  .onCreate(async (snapshot, context) => {
    const taskId = context.params.taskId;
    const taskData = snapshot.data();

    // Prevent infinite trigger loops
    if (taskData.aiAnalysis) {
      console.log(`[DEBUG] Task ${taskId} already has AI analysis. Skipping.`);
      return null;
    }

    console.log(`[DEBUG] Triggered onTaskCreated for task: ${taskId}`);

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith("mock_")) {
      console.warn("[WARNING] No valid Gemini API key found for Cloud Function trigger.");
      return null;
    }

    const prompt = `You are Sentri, an AI task and calendar risk analyzer.
Analyze this newly created task:
Title: "${taskData.title}"
Description: "${taskData.description || ''}"
Tag: "${taskData.tag || ''}"
User Risk: ${taskData.risk || 50}%
Deadline: "${taskData.deadline || ''}"

Perform a detailed risk assessment. Calculate:
1. Real deadline miss risk (0-100)
2. Expected focus efficiency score (0-100)
3. Estimated duration (e.g., "3 hours", "45 mins")
4. Recommended start time (e.g., "10:30 AM")
5. Up to 3 specific reasoning bullet points
6. Next immediate action
7. A list of 3-5 subtasks (e.g., ["Subtask 1", "Subtask 2"])
8. A Rescue Plan with 2-3 specific calendar optimization actions (e.g., ["Decline weekly sync", "Block 4-hour focus slot"]) if risk is high (>= 75%).

You MUST respond with a single, valid JSON object matching this structure and no other text:
{
  "priority": "High" | "Medium" | "Low",
  "risk": number (0-100),
  "productivityScore": number (0-100),
  "estimatedDuration": "string",
  "recommendedStartTime": "string",
  "reasoning": ["string"],
  "nextAction": "string",
  "subtasks": ["string"],
  "rescuePlan": ["string"]
}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const responseText = result.response.text();
      console.log(`[DEBUG] Gemini response for task ${taskId}:`, responseText);
      
      const analysis = JSON.parse(responseText.trim());

      const updates = {
        aiAnalysis: analysis,
        risk: analysis.risk,
        priority: analysis.priority,
        reasoning: [
          `Sentri AI Analysis completed: Estimated ${analysis.estimatedDuration}`,
          ...analysis.reasoning
        ],
        subtasksList: analysis.subtasks || [],
        rescuePlan: analysis.rescuePlan || []
      };

      // If the risk is high (>= 75%), we also create a proposal document!
      if (analysis.risk >= 75) {
        console.log(`[DEBUG] Task ${taskId} risk is critical (${analysis.risk}%). Generating proposal.`);
        const proposalId = `p_${taskId}`;
        const proposalDoc = {
          id: proposalId,
          userId: taskData.userId || "anonymous",
          taskId: taskId,
          task: taskData.title,
          risk: analysis.risk,
          reason: analysis.reasoning.join(" + "),
          actions: (analysis.rescuePlan || ["Reschedule overlapping syncs"]).map(act => ({ label: act })),
          deadline: taskData.deadline,
          newRisk: Math.round(analysis.risk * 0.25)
        };
        await db.collection("proposals").doc(proposalId).set(proposalDoc);
      }

      await snapshot.ref.update(updates);
      console.log(`[DEBUG] Successfully updated task ${taskId} with Gemini analysis.`);
      return null;
    } catch (error) {
      console.error(`[ERROR] Failed to run Gemini analysis for task ${taskId}:`, error);
      return null;
    }
  });

// Start standalone server if run directly (e.g. on Render)
if (require.main === module || process.env.PORT) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Sentri Backend server is listening on port ${port}`);
  });
}
