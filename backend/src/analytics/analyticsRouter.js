const express = require("express");
const { db } = require("../config/firestore");

const router = express.Router();

// GET productivity summary stats
router.get("/summary", async (req, res) => {
  try {
    // 1. Query active tasks to calculate metrics dynamically
    const snapshot = await db.collection("tasks").get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push(doc.data());
    });
    
    const active = tasks.filter(t => t.status !== "done");
    const highRiskCount = active.filter(t => t.risk >= 75).length;
    const aiManagedCount = active.filter(t => t.aiManaged).length;
    
    // Average risk index
    const avgRisk = active.length 
      ? Math.round(active.reduce((sum, t) => sum + t.risk, 0) / active.length)
      : 0;

    // Focus Index score (inverse of average risk)
    const focusScore = 100 - avgRisk;

    // Mock trend datasets
    const trendData = [
      { name: "Mon", score: 72 },
      { name: "Tue", score: 85 },
      { name: "Wed", score: 68 },
      { name: "Thu", score: 94 },
      { name: "Fri", score: focusScore || 88 }
    ];

    res.json({
      focusScore,
      reclaimedHours: 11.5,
      syncRate: 99.8,
      highRiskCount,
      aiManagedCount,
      trendData
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to compile analytics: " + error.message });
  }
});

module.exports = router;
