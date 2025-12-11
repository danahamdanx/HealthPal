import { db } from "../config/db.js";
import { sendEmail } from "../utils/mailer.js";

// قائمة التخصصات العلاجية
const therapySpecialties = [
  "clinical psychology",
  "psychology",
  "counseling",
  "psychiatry",
  "behavioral therapy",
  "aba therapy",
  "speech therapy",
  "speech and language",
  "slp",
  "occupational therapy",
  "ot",
  "physical therapy",
  "physiotherapy",
  "rehabilitation",
  "family therapy",
  "couples therapy",
  "marriage counseling",
  "child therapy",
  "adolescent therapy",
  "trauma therapy",
  "ptsd therapy",
  "addiction therapy",
  "art therapy",
  "music therapy",
  "play therapy"
];

/* ---------------------------------------------------
   Get all doctors that provide therapy sessions
--------------------------------------------------- */
export const getTherapyDoctors = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT doctor_id, name, email, phone, specialty 
       FROM Doctors`
    );

    const filtered = rows.filter(d =>
      therapySpecialties.includes(d.specialty.toLowerCase())
    );

    res.json(filtered);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching therapy doctors" });
  }
};


/* ---------------------------------------------------
   Create a new therapy session (booking)
--------------------------------------------------- */
export const createTherapySession = async (req, res) => {
  try {
    if (!req.user.patient_id) return res.status(403).json({ error: "Only patients can book sessions" });

    const { doctor_id, scheduled_time, duration_minutes, session_focus, session_mode, recurring, initial_concerns } = req.body;

    const [doc] = await db.query(`SELECT name, email, specialty FROM Doctors WHERE doctor_id = ?`, [doctor_id]);
    if (!doc.length) return res.status(404).json({ error: "Doctor not found" });

    const doctor = doc[0];
    if (!therapySpecialties.includes(doctor.specialty.toLowerCase()))
      return res.status(400).json({ error: "This doctor does not provide therapy services" });

    const [result] = await db.query(
      `INSERT INTO TherapySessions 
      (patient_id, doctor_id, scheduled_time, duration_minutes, session_focus, session_mode, recurring, initial_concerns)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.patient_id, doctor_id, scheduled_time, duration_minutes || 60, session_focus || null, session_mode || "in_person", recurring || "none", initial_concerns || null]
    );

    const [session] = await db.query(`SELECT * FROM TherapySessions WHERE session_id = ?`, [result.insertId]);

    // Fetch patient info for email
    const [patientRows] = await db.query(`SELECT name, email FROM Patients WHERE patient_id = ?`, [req.user.patient_id]);
    const patient = patientRows[0];

    // Send email notifications to patient and doctor
    if (patient?.email) {
      await sendEmail({
        email: patient.email,
        subject: "Therapy Session Scheduled",
        message: `Hello ${patient.name}, your therapy session with Dr. ${doctor.name} is scheduled on ${scheduled_time}.`,
        html: `<p>Hello <strong>${patient.name}</strong>,</p><p>Your therapy session with Dr. <strong>${doctor.name}</strong> is scheduled on <strong>${scheduled_time}</strong>.</p>`
      });
    }

    if (doctor?.email) {
      await sendEmail({
        email: doctor.email,
        subject: "New Therapy Session Booking",
        message: `Dr. ${doctor.name}, a new therapy session has been booked by ${patient.name} on ${scheduled_time}.`,
        html: `<p>Dr. <strong>${doctor.name}</strong>, a new therapy session has been booked by <strong>${patient.name}</strong> on <strong>${scheduled_time}</strong>.</p>`
      });
    }

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


/* ---------------------------------------------------
   Get all therapy sessions for a doctor
--------------------------------------------------- */
export const getDoctorTherapySessions = async (req, res) => {
  try {
    if (!req.user.doctor_id)
      return res.status(403).json({ error: "Doctors only" });

    const [sessions] = await db.query(`
      SELECT *
      FROM TherapySessions
      WHERE doctor_id = ?
      ORDER BY scheduled_time DESC
    `, [req.user.doctor_id]);

    res.json(sessions);

  } catch (err) {
    console.error("Error fetching doctor therapy sessions:", err);
    res.status(500).json({ error: "Error fetching sessions" });
  }
};


/* ---------------------------------------------------
   Update session status (+ cancellation reason)
--------------------------------------------------- */
export const updateTherapySessionStatus = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status, cancellation_reason } = req.body;

    const validStatuses = ["approved", "rejected", "completed", "canceled"];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const [sessions] = await db.query(
      `SELECT * FROM TherapySessions WHERE session_id = ?`,
      [sessionId]
    );

    if (!sessions.length)
      return res.status(404).json({ error: "Session not found" });

    // تحديث مع سبب الإلغاء
    if (status === "canceled") {
      await db.query(
        `UPDATE TherapySessions 
         SET status = ?, cancellation_reason = ?
         WHERE session_id = ?`,
        [status, cancellation_reason || null, sessionId]
      );
    } else {
      await db.query(
        `UPDATE TherapySessions 
         SET status = ?
         WHERE session_id = ?`,
        [status, sessionId]
      );
    }

    const [updated] = await db.query(
      `SELECT * FROM TherapySessions WHERE session_id = ?`,
      [sessionId]
    );

    res.json(updated[0]);

  } catch (err) {
    console.error("Error updating session status:", err);
    res.status(500).json({ error: "Error updating status" });
  }
};



export const updateTherapySessionNotes = async (req, res) => {
  try {
    const { session_notes, progress_notes } = req.body;
    const sessionId = req.params.id;

    // تأكد أن الدكتور هو صاحب الجلسة
    const [sessions] = await db.query(
      `SELECT * FROM TherapySessions WHERE session_id = ? AND doctor_id = ?`,
      [sessionId, req.user.doctor_id]
    );

    if (!sessions.length) return res.status(403).json({ error: "Not authorized" });

    await db.query(
      `UPDATE TherapySessions 
       SET session_notes = ?, progress_notes = ?, status = 'completed'
       WHERE session_id = ?`,
      [session_notes || null, progress_notes || null, sessionId]
    );

    const [updated] = await db.query(
      `SELECT * FROM TherapySessions WHERE session_id = ?`,
      [sessionId]
    );

    res.json(updated[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating session notes" });
  }
};
