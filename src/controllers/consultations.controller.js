import { db } from '../config/db.js';

/**
 * CRUD controller for Consultations with role-based access.
 */

// ✅ Get all consultations
export const getAllConsultations = async (req, res) => {
  try {
    let query = 'SELECT * FROM Consultations';
    const params = [];

    if (req.user.role === 'patient') {
      query += ' WHERE patient_id = ?';
      params.push(req.user.user_id);
    } else if (req.user.role === 'doctor') {
      query += ' WHERE doctor_id = ?';
      params.push(req.user.user_id);
    }
    query += ' ORDER BY consultation_id DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching consultations' });
  }
};

// ✅ Get single consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });

    const consultation = rows[0];

    // Role-based access
    if (req.user.role === 'patient' && consultation.patient_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'doctor' && consultation.doctor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(consultation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching consultation' });
  }
};

// ✅ Create a consultation
export const createConsultation = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      scheduled_time,
      status,
      consultation_type,
      translation_needed,
      notes,
      diagnosis,
      treatment
    } = req.body;

    // Minimal validation
    if (!patient_id || !doctor_id || !scheduled_time || !status || !consultation_type) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const [result] = await db.query(
      `INSERT INTO Consultations 
      (patient_id, doctor_id, scheduled_time, status, consultation_type, translation_needed, notes, diagnosis, treatment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, scheduled_time, status, consultation_type, translation_needed, notes, diagnosis, treatment]
    );

    const [newConsultation] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [result.insertId]);
    res.status(201).json(newConsultation[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating consultation' });
  }
};

// ✅ Update a consultation
export const updateConsultation = async (req, res) => {
  try {
    const allowedFields = [
      'patient_id', 'doctor_id', 'scheduled_time', 'status',
      'consultation_type', 'translation_needed', 'notes', 'diagnosis', 'treatment'
    ];

    const updates = [];
    const values = [];

    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(req.params.id);
    const [result] = await db.query(`UPDATE Consultations SET ${updates.join(', ')} WHERE consultation_id = ?`, values);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consultation not found' });

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
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consultation not found' });
    res.json({ message: 'Consultation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error deleting consultation' });
  }
};
