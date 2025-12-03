import { db } from "../config/db.js";


export const createHealthGuide = async (req, res) => {
  try {
    const { title, category, content, image_url, language } = req.body;

    const [result] = await db.query(
      `INSERT INTO HealthGuides (title, category, content, language, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [title, category, content, language || 'ar', image_url || null]
    );

    const [guide] = await db.query(`SELECT * FROM HealthGuides WHERE guide_id=?`, [result.insertId]);
    res.status(201).json(guide[0]);

  } catch (err) {
    res.status(500).json({ error: "Error creating guide" });
  }
};

export const getPublicHealthAlerts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM PublicHealthAlerts ORDER BY created_at DESC");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Error fetching alerts" });
  }
};


export const createPublicHealthAlert = async (req, res) => {
  try {
    const { title, message, alert_type, region, severity, expires_at } = req.body;

    const [result] = await db.query(`
      INSERT INTO PublicHealthAlerts (title, message, alert_type, region, severity, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, message, alert_type, region, severity, expires_at || null]);

    const [alert] = await db.query(`SELECT * FROM PublicHealthAlerts WHERE alert_id=?`, [result.insertId]);
    res.status(201).json(alert[0]);

  } catch {
    res.status(500).json({ error: "Error creating alert" });
  }
};


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
