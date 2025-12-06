import { db } from '../config/db.js';
import { sendEmail } from '../utils/mailer.js';


// ✅ Get all consultations
export const getAllConsultations = async (req, res) => {
  try {
    let query = 'SELECT * FROM Consultations';
    const params = [];

    // 🔹 Dynamically filter based on role
    if (req.user.role === 'doctor' && req.user.doctor_id) {
      query += ' WHERE doctor_id = ?';
      params.push(req.user.doctor_id);
    } else if (req.user.role === 'patient' && req.user.patient_id) {
      query += ' WHERE patient_id = ?';
      params.push(req.user.patient_id);
    }
    // Admins, NGOs, etc. see everything by default

    query += ' ORDER BY consultation_id DESC';
    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching consultations' });
  }
};

export const getConsultationById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Consultations WHERE consultation_id = ?',
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Consultation not found' });

    const consultation = rows[0];

    // 🔹 Restrict access dynamically
    if (req.user.role === 'doctor' && req.user.doctor_id !== consultation.doctor_id)
      return res.status(403).json({ error: 'Not authorized to view this consultation' });

    if (req.user.role === 'patient' && req.user.patient_id !== consultation.patient_id)
      return res.status(403).json({ error: 'Not authorized to view this consultation' });

    res.json(consultation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching consultation' });
  }
};


export const createConsultation = async (req, res) => {
  try {
    const { patient_id, doctor_id, scheduled_time, consultation_type, translation_needed } = req.body;

    if (!patient_id || !doctor_id || !scheduled_time || !consultation_type || translation_needed === undefined) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Default values for new consultation
    const status = 'pending';
    const notes = null;
    const diagnosis = null;
    const treatment = null;

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO Consultations 
      (patient_id, doctor_id, scheduled_time, status, consultation_type, translation_needed, notes, diagnosis, treatment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, scheduled_time, status, consultation_type, translation_needed, notes, diagnosis, treatment]
    );

    const [newConsultation] = await db.query(
      'SELECT * FROM Consultations WHERE consultation_id = ?',
      [result.insertId]
    );

    // Fetch patient details for email
    const [patientRows] = await db.query('SELECT name, email FROM Patients WHERE patient_id = ?', [patient_id]);
    const patient = patientRows[0];

    if (patient && patient.email) {
      // Send email notification
      await sendEmail({
        email: patient.email,
        subject: 'Appointment Pending',
        message: `Hello ${patient.name},\n\nYour appointment is Pending for ${scheduled_time} with doctor ID ${doctor_id}.\n\nThank you!`,
        html: `<p>Hello ${patient.name},</p>
               <p>Your appointment is Pending for <strong>${scheduled_time}</strong> with doctor ID <strong>${doctor_id}</strong>.</p>
               <p>Thank you!</p>`
      });
    }

    res.status(201).json(newConsultation[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating consultation' });
  }
};



// ✅ Update a consultation
export const updateConsultation = async (req, res) => {
  try {
    const { role, patient_id: userPatientId, doctor_id: userDoctorId } = req.user;

    const [rows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Consultation not found' });
    const consultation = rows[0];

    const updates = [];
    const values = [];

    const patientFields = ['scheduled_time', 'consultation_type', 'translation_needed'];
    const doctorFields = ['status', 'notes', 'diagnosis', 'treatment'];

    if (role === 'patient') {
      if (consultation.patient_id !== userPatientId)
        return res.status(403).json({ error: 'Not authorized' });
      patientFields.forEach(f => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
    } else if (role === 'doctor') {
      if (consultation.doctor_id !== userDoctorId)
        return res.status(403).json({ error: 'Not authorized' });
      doctorFields.forEach(f => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
    } else if (role === 'admin') {
      Object.keys(req.body).forEach(f => {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      });
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(req.params.id);
    await db.query(`UPDATE Consultations SET ${updates.join(', ')} WHERE consultation_id = ?`, values);

    const [updatedRows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [req.params.id]);
    const updatedConsultation = updatedRows[0];

    // Send email to patient
    const [patientRows] = await db.query('SELECT name, email FROM Patients WHERE patient_id = ?', [consultation.patient_id]);
    const patient = patientRows[0];

    if (patient && patient.email) {
      await sendEmail({
        email: patient.email,
        subject: 'Consultation Updated',
        message: `Hello ${patient.name},\n\nYour consultation has been updated.\nCurrent Status: ${updatedConsultation.status}\nScheduled Time: ${updatedConsultation.scheduled_time}\n\nThank you!`,
        html: `<p>Hello ${patient.name},</p>
               <p>Your consultation has been updated.</p>
               <p><strong>Status:</strong> ${updatedConsultation.status}</p>
               <p><strong>Scheduled Time:</strong> ${updatedConsultation.scheduled_time}</p>
               <p>Thank you!</p>`
      });
    }

    res.json(updatedConsultation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error updating consultation' });
  }
};

/**
 * Update only the status of a consultation
 */
export const updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const allowedStatus = ['pending', 'scheduled', 'canceled', 'completed'];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatus.join(', ')}` });

    const [result] = await db.query('UPDATE Consultations SET status = ? WHERE consultation_id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consultation not found' });

    const [updatedRows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [id]);
    const updatedConsultation = updatedRows[0];

    // Send email to patient
    const [patientRows] = await db.query('SELECT name, email FROM Patients WHERE patient_id = ?', [updatedConsultation.patient_id]);
    const patient = patientRows[0];

    if (patient && patient.email) {
      await sendEmail({
        email: patient.email,
        subject: 'Consultation Status Updated',
        message: `Hello ${patient.name},\n\nThe status of your consultation has been updated to: ${status}.\nScheduled Time: ${updatedConsultation.scheduled_time}\n\nThank you!`,
        html: `<p>Hello ${patient.name},</p>
               <p>The status of your consultation has been updated.</p>
               <p><strong>Status:</strong> ${status}</p>
               <p><strong>Scheduled Time:</strong> ${updatedConsultation.scheduled_time}</p>
               <p>Thank you!</p>`
      });
    }

    res.json(updatedConsultation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error updating consultation status' });
  }
};



// ✅ Delete a consultation
export const deleteConsultation = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Consultations WHERE consultation_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Consultation not found' });
    res.json({ message: 'Consultation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error deleting consultation' });
  }
};
