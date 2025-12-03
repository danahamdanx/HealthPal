import { db } from '../config/db.js';

export const getHealthGuides = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HealthGuides ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching guides" });
  }
};
