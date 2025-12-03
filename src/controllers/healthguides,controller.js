import { db } from '../config/db.js';

export const getHealthGuides = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM HealthGuides ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching guides" });
  }
};

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
