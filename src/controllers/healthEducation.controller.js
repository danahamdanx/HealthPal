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

 } catch (err) {
  console.error("Create Workshop Error:", err);
  res.status(500).json({ error: "Error creating workshop" });
}

};

export const registerForWorkshop = async (req, res) => {
  try {
    const userId = req.user.user_id;   // من التوكن
    const { id: workshopId } = req.params;

    // 1) تأكد أن الورشة موجودة
    const [workshop] = await db.query(
      `SELECT * FROM HealthWorkshops WHERE workshop_id = ?`,
      [workshopId]
    );

    if (workshop.length === 0) {
      return res.status(404).json({ error: "Workshop not found" });
    }

    // 2) تأكد ما سجّل قبل
    const [existing] = await db.query(
      `SELECT * FROM WorkshopRegistrations WHERE workshop_id = ? AND user_id = ?`,
      [workshopId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Already registered in this workshop" });
    }

    // 3) تأكد إنه لسه في أماكن فاضية
    const [count] = await db.query(
      `SELECT COUNT(*) AS total FROM WorkshopRegistrations WHERE workshop_id = ?`,
      [workshopId]
    );

    if (workshop[0].max_attendees && count[0].total >= workshop[0].max_attendees) {
      return res.status(400).json({ error: "Workshop is full" });
    }

    // 4) سجّل المستخدم
    const [result] = await db.query(
      `INSERT INTO WorkshopRegistrations (workshop_id, user_id) VALUES (?, ?)`,
      [workshopId, userId]
    );

    res.status(201).json({
      message: "Registration successful",
      registration_id: result.insertId
    });

  } catch (err) {
    console.error("Register Workshop Error:", err);
    res.status(500).json({ error: "Error registering for workshop" });
  }
};

export const getWorkshopParticipants = async (req, res) => {
  try {
    const { id: workshopId } = req.params;

    const [data] = await db.query(
      `SELECT u.user_id, u.name, u.email, r.registration_date
       FROM WorkshopRegistrations r
       JOIN Users u ON r.user_id = u.user_id
       WHERE r.workshop_id = ?`,
      [workshopId]
    );

    res.json(data);

  } catch {
    res.status(500).json({ error: "Error fetching participants" });
  }
};

export const getMyWorkshops = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await db.query(
      `SELECT w.*
       FROM WorkshopRegistrations r
       JOIN HealthWorkshops w ON r.workshop_id = w.workshop_id
       WHERE r.user_id = ?`,
      [userId]
    );

    res.json(rows);

  } catch {
    res.status(500).json({ error: "Error fetching user workshops" });
  }
};
