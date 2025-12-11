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
   Get all doctors who provide therapy services
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
   Create a therapy session (Booking)
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
      initial_concerns,
      price,
      session_type
    } = req.body;

    // تأكيد وجود الدكتور
    const [doc] = await db.query(
      `SELECT name, email, specialty FROM Doctors WHERE doctor_id = ?`,
      [doctor_id]
    );

    if (!doc.length)
      return res.status(404).json({ error: "Doctor not found" });

    const doctor = doc[0];

    // يتأكد انه فعلاً طبيب علاج
    if (!therapySpecialties.includes(doctor.specialty.toLowerCase()))
      return res.status(400).json({ error: "Doctor does not offer therapy services" });

    // منع الحجز المكرر لنفس الوقت
    const [existing] = await db.query(
      `SELECT * FROM TherapySessions 
       WHERE doctor_id = ? AND scheduled_time = ? 
       AND status NOT IN ('canceled', 'rejected')`,
      [doctor_id, scheduled_time]
    );

    if (existing.length > 0)
      return res.status(400).json({
        error: "This time slot is already booked"
      });

    // إنشاء الجلسة
    const [result] = await db.query(
      `INSERT INTO TherapySessions 
      (patient_id, doctor_id, scheduled_time, duration_minutes,
       session_focus, session_mode, recurring, initial_concerns,
       price, payment_status, session_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        req.user.patient_id,
        doctor_id,
        scheduled_time,
        duration_minutes || 60,
        session_focus || null,
        session_mode || "in_person",
        recurring || "none",
        initial_concerns || null,
        price || 0,
        session_type || "individual"
      ]
    );

    const [session] = await db.query(
      `SELECT * FROM TherapySessions WHERE session_id = ?`,
      [result.insertId]
    );

    // جلب بيانات المريض لإرسال إيميل
    const [patientRows] = await db.query(
      `SELECT name, email FROM Patients WHERE patient_id = ?`,
      [req.user.patient_id]
    );

    const patient = patientRows[0];

    // إرسال إيميل للمريض
    if (patient?.email) {
      await sendEmail({
        email: patient.email,
        subject: "Therapy Session Scheduled",
        message: `Hello ${patient.name}, your session with Dr. ${doctor.name} is scheduled at ${scheduled_time}.`
      });
    }

    // إرسال إيميل للطبيب
    if (doctor?.email) {
      await sendEmail({
        email: doctor.email,
        subject: "New Therapy Session Booking",
        message: `Dr. ${doctor.name}, you have a new session booked by ${patient.name} at ${scheduled_time}.`
      });
    }

    res.status(201).json(session[0]);

  } catch (err) {
    console.error("Error creating therapy session:", err);
    res.status(500).json({ error: "Error creating therapy session" });
  }
};


/* ---------------------------------------------------
   Get sessions for logged-in patient
--------------------------------------------------- */
export const getPatientTherapySessions = async (req, res) => {
  try {
    if (!req.user.patient_id)
      return res.status(403).json({ error: "Patients only" });

    const [sessions] = await db.query(
      `SELECT * FROM TherapySessions
       WHERE patient_id = ?
       ORDER BY scheduled_time DESC`,
      [req.user.patient_id]
    );

    res.json(sessions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading patient sessions" });
  }
};


/* ---------------------------------------------------
   Get sessions for logged-in doctor
--------------------------------------------------- */
export const getDoctorTherapySessions = async (req, res) => {
  try {
    if (!req.user.doctor_id)
      return res.status(403).json({ error: "Doctors only" });

    const [sessions] = await db.query(
      `SELECT * FROM TherapySessions
       WHERE doctor_id = ?
       ORDER BY scheduled_time DESC`,
      [req.user.doctor_id]
    );

    res.json(sessions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading doctor sessions" });
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


/* ---------------------------------------------------
   Update therapy session notes (doctor only)
--------------------------------------------------- */
export const updateTherapySessionNotes = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { session_notes, progress_notes } = req.body;

    const [sessions] = await db.query(
      `SELECT * FROM TherapySessions 
       WHERE session_id = ? AND doctor_id = ?`,
      [sessionId, req.user.doctor_id]
    );

    if (!sessions.length)
      return res.status(403).json({ error: "Not authorized" });

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
    res.status(500).json({ error: "Error updating notes" });
  }
};