import { db } from '../config/db.js';

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

    // Only patient can create consultations
    if (!patient_id || !doctor_id || !scheduled_time || !consultation_type||!translation_needed) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Status defaults to 'pending'
    const status = 'pending';
    const notes = null;
    const diagnosis = null;
    const treatment = null;

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

    // Patient can only update these
    const patientFields = ['scheduled_time', 'consultation_type', 'translation_needed'];

    // Doctor can update status, notes, diagnosis, treatment
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
      // Admin can update everything
      Object.keys(req.body).forEach(f => {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      });
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(req.params.id);
    const [result] = await db.query(
      `UPDATE Consultations SET ${updates.join(', ')} WHERE consultation_id = ?`,
      values
    );

    const [updated] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error updating consultation' });
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
