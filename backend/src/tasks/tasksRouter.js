const express = require("express");
const { db } = require("../config/firestore");

const router = express.Router();

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push(doc.data());
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks: " + error.message });
  }
});

// POST create task
router.post("/", async (req, res) => {
  try {
    const taskData = req.body;
    if (!taskData.id) {
      taskData.id = "t_" + Date.now();
    }
    if (!taskData.status) {
      taskData.status = "todo";
    }
    if (!taskData.risk) {
      taskData.risk = Math.floor(Math.random() * 40) + 10; // default low-med risk
    }
    
    await db.collection("tasks").doc(taskData.id).set(taskData);
    res.status(201).json(taskData);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task: " + error.message });
  }
});

// PUT update task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const docRef = db.collection("tasks").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    res.status(500).json({ error: "Failed to update task: " + error.message });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("tasks").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    await docRef.delete();
    res.json({ success: true, message: `Task ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task: " + error.message });
  }
});

module.exports = router;
