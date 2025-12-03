import { db } from "../config/db.js";
export const getHealthWorkshops = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HealthWorkshops ORDER BY start_time ASC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error fetching workshops" });
  }
};
