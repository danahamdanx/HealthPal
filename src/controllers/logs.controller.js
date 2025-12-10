// src/controllers/logs.controller.js
import { db } from "../config/db.js";

export const createLog = async ({ user_id, action, status_code = null, message = null }) => {
  try {
    await db.query(
      `INSERT INTO Logs (user_id, action, status_code, message)
       VALUES (?, ?, ?, ?)`,
      [user_id, action, status_code, message]
    );
  } catch (err) {
    console.error("Error creating log:", err);
  }
};

// Optional: fetch logs
export const getAllLogs = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM Logs ORDER BY timestamp DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching logs" });
  }
};
