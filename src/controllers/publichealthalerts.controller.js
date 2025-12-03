import { db } from '../config/db.js';
export const getPublicHealthAlerts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM PublicHealthAlerts ORDER BY created_at DESC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error fetching alerts" });
  }
};
