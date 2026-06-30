const express = require("express");
const { db } = require("../config/firestore");

const router = express.Router();

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("notifications").get();
    const list = [];
    snapshot.forEach(doc => {
      list.push(doc.data());
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications: " + error.message });
  }
});

// PUT update notification status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const docRef = db.collection("notifications").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    await docRef.update(updates);
    const updated = await docRef.get();
    res.json(updated.data());
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification: " + error.message });
  }
});

// POST resolve notification action
router.post("/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("notifications").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    // Resolve notification
    await docRef.update({
      read: true,
      resolved: true,
      title: "Schedule optimized successfully",
      text: "Sentri autopilot cleared conflict. Focus blocks synced."
    });
    
    const updated = await docRef.get();
    res.json(updated.data());
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve notification: " + error.message });
  }
});

// DELETE notification
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("notifications").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    await docRef.delete();
    res.json({ success: true, message: `Notification ${id} dismissed` });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification: " + error.message });
  }
});

module.exports = router;
