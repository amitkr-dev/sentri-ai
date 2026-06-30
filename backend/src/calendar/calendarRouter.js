const express = require("express");
const { db } = require("../config/firestore");

const router = express.Router();

// GET all calendar events
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("calendarEvents").get();
    const events = [];
    snapshot.forEach(doc => {
      events.push(doc.data());
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch calendar events: " + error.message });
  }
});

// POST optimize calendar (declines low-priority meetings, locks down focus blocks)
router.post("/optimize", async (req, res) => {
  try {
    // 1. Fetch current events
    const snapshot = await db.collection("calendarEvents").get();
    const events = [];
    snapshot.forEach(doc => {
      events.push(doc.data());
    });
    
    // 2. Perform optimization operations:
    // - Remove 'Team standup' or modify it
    // - Add a big 4-hour AI focus block
    const standupEvt = events.find(e => e.title === "Team standup");
    const clientEvt = events.find(e => e.title === "Client call");
    
    // Simulate declines by updating database docs
    if (standupEvt) {
      await db.collection("calendarEvents").doc(standupEvt.id).delete();
    }
    
    // Add/Update focus block
    const focusBlock = {
      id: "evt_focus_opt",
      title: "Optimized Focus Lock - Stripe Integration",
      source: "ai_focus",
      start: 9.5,
      end: 13.5,
      reason: "Autopilot reallocated afternoon slots to secure focus blocks before critical api deadline."
    };
    
    await db.collection("calendarEvents").doc(focusBlock.id).set(focusBlock);
    
    // 3. Re-fetch and return optimized schedule
    const newSnapshot = await db.collection("calendarEvents").get();
    const newEvents = [];
    newSnapshot.forEach(doc => {
      newEvents.push(doc.data());
    });
    
    res.json({
      success: true,
      message: "Autopilot restructured calendar successfully",
      events: newEvents
    });
  } catch (error) {
    res.status(500).json({ error: "Optimization fail: " + error.message });
  }
});

module.exports = router;
