import { db } from "../config/db.js";
export const getHealthWorkshops = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HealthWorkshops ORDER BY start_time ASC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error fetching workshops" });
  }
};

export const createHealthWorkshop = async (req, res) => {
  try {
    const {
      title, description, instructor, mode, location,
      start_time, end_time, max_attendees
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO HealthWorkshops 
      (title, description, instructor, mode, location, start_time, end_time, max_attendees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, instructor,
      mode || "online",
      location || null,
      start_time, end_time, max_attendees || null
    ]);

    const [workshop] = await db.query(`SELECT * FROM HealthWorkshops WHERE workshop_id=?`, [result.insertId]);

    res.status(201).json(workshop[0]);

  } catch {
    res.status(500).json({ error: "Error creating workshop" });
  }
};
