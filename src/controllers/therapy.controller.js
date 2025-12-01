import { db } from "../config/db.js";

/* ---------------------------------------------------
   Get all doctors that provide therapy sessions
--------------------------------------------------- */
export const getTherapyDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT doctor_id, user_id, specialty, bio, years_experience
      FROM Doctors
      WHERE specialty = 'therapy'
    `);

    res.json(doctors);

  } catch (err) {
    console.error("Error fetching therapy doctors:", err);
    res.status(500).json({ error: "Error fetching therapy doctors" });
  }
};

/* ---------------------------------------------------
   Create a new therapy session (booking)
--------------------------------------------------- */
export const createTherapySession = async (req, res) => {
  try {
    if (!req.user.patient_id)
      return res.status(403).json({ error: "Only patients can book sessions" });

    const {
      doctor_id,
      scheduled_time,
      duration_minutes,
      session_focus,
      session_mode,
      recurring,
      initial_concerns
    } = req.body;

    // Check if doctor exists and is a therapy specialist
    const [doc] = await db.query(`
      SELECT specialty FROM Doctors WHERE doctor_id = ?
    `, [doctor_id]);

    if (!doc.length)
      return res.status(404).json({ error: "Doctor not found" });

    if (doc[0].specialty !== "therapy")
      return res.status(400).json({ error: "This doctor does not offer therapy" });

    // Insert session
    const [result] = await db.query(`
      INSERT INTO TherapySessions 
      (patient_id, doctor_id, scheduled_time, duration_minutes, 
       session_focus, session_mode, recurring, initial_concerns)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.patient_id,
      doctor_id,
      scheduled_time,
      duration_minutes || 60,
      session_focus || null,
      session_mode || "in_person",
      recurring || "none",
      initial_concerns || null
    ]);

    const [session] = await db.query(`
      SELECT * FROM TherapySessions WHERE session_id = ?
    `, [result.insertId]);

    res.status(201).json(session[0]);

  } catch (err) {
    console.error("Error creating therapy session:", err);
    res.status(500).json({ error: "Error creating therapy session" });
  }
};

/* ---------------------------------------------------
   Get all therapy sessions for a patient
--------------------------------------------------- */
export const getPatientTherapySessions = async (req, res) => {
  try {
    if (!req.user.patient_id)
      return res.status(403).json({ error: "Patients only" });

    const [sessions] = await db.query(`
      SELECT *
      FROM TherapySessions
      WHERE patient_id = ?
      ORDER BY scheduled_time DESC
    `, [req.user.patient_id]);

    res.json(sessions);

  } catch (err) {
    console.error("Error fetching patient therapy sessions:", err);
    res.status(500).json({ error: "Error fetching sessions" });
  }
};