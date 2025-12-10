import { db } from '../config/db.js';  // <- لاحظ ../src/ لأنها خارج src
import { sendEmail } from '../utils/mailer.js';

// Get all consultations
export const getAllConsultations = async (user) => {
  let query = 'SELECT * FROM Consultations';
  const params = [];

  if (user.role === 'doctor' && user.doctor_id) {
    query += ' WHERE doctor_id = ?';
    params.push(user.doctor_id);
  } else if (user.role === 'patient' && user.patient_id) {
    query += ' WHERE patient_id = ?';
    params.push(user.patient_id);
  }

  query += ' ORDER BY consultation_id DESC';
  const [rows] = await db.query(query, params);
  return rows;
};

// Get consultation by ID
export const getConsultationById = async (id, user) => {
  const [rows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [id]);
  if (!rows.length) throw new Error('Consultation not found');

  const consultation = rows[0];

  if (user.role === 'doctor' && user.doctor_id !== consultation.doctor_id)
    throw new Error('Not authorized to view this consultation');
  if (user.role === 'patient' && user.patient_id !== consultation.patient_id)
    throw new Error('Not authorized to view this consultation');

  return consultation;
};

// Create consultation
export const createConsultation = async (data) => {
  const { patient_id, doctor_id, scheduled_time, consultation_type, translation_needed } = data;

  if (!patient_id || !doctor_id || !scheduled_time || !consultation_type || translation_needed === undefined) {
    throw new Error('Required fields missing');
  }

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

  const [patientRows] = await db.query('SELECT name, email FROM Patients WHERE patient_id = ?', [patient_id]);
  const patient = patientRows[0];

  if (patient?.email) {
    await sendEmail({
      email: patient.email,
      subject: 'Appointment Pending',
      message: `Hello ${patient.name}, your appointment is pending for ${scheduled_time}.`,
      html: `<p>Hello ${patient.name},</p><p>Your appointment is pending for <strong>${scheduled_time}</strong>.</p>`
    });
  }

  return newConsultation[0];
};

// Update consultation
export const updateConsultation = async (id, user, updates) => {
  const [rows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [id]);
  if (!rows.length) throw new Error('Consultation not found');
  const consultation = rows[0];

  const allowedFields = [];
  if (user.role === 'patient') {
    if (user.patient_id !== consultation.patient_id) throw new Error('Not authorized');
    allowedFields.push('scheduled_time', 'consultation_type', 'translation_needed');
  } else if (user.role === 'doctor') {
    if (user.doctor_id !== consultation.doctor_id) throw new Error('Not authorized');
    allowedFields.push('status', 'notes', 'diagnosis', 'treatment');
  } else if (user.role === 'admin') {
    allowedFields.push(...Object.keys(updates));
  } else {
    throw new Error('Not authorized');
  }

  const setFields = [];
  const values = [];
  allowedFields.forEach(f => {
    if (updates[f] !== undefined) {
      setFields.push(`${f} = ?`);
      values.push(updates[f]);
    }
  });

  if (!setFields.length) throw new Error('No valid fields to update');

  values.push(id);
  await db.query(`UPDATE Consultations SET ${setFields.join(', ')} WHERE consultation_id = ?`, values);

  const [updatedRows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [id]);
  return updatedRows[0];
};

// Update only the status of a consultation
export const updateConsultationStatus = async (id, status) => {
  if (!status) throw new Error('Status is required');

  const allowedStatus = ['pending', 'scheduled', 'canceled', 'completed'];
  if (!allowedStatus.includes(status))
    throw new Error(`Invalid status. Allowed: ${allowedStatus.join(', ')}`);

  // تحديث الحالة
  const [result] = await db.query('UPDATE Consultations SET status = ? WHERE consultation_id = ?', [status, id]);
  if (result.affectedRows === 0) throw new Error('Consultation not found');

  // جلب البيانات المحدثة
  const [updatedRows] = await db.query('SELECT * FROM Consultations WHERE consultation_id = ?', [id]);
  const updatedConsultation = updatedRows[0];

  // إرسال البريد الإلكتروني للمريض
  const [patientRows] = await db.query('SELECT name, email FROM Patients WHERE patient_id = ?', [updatedConsultation.patient_id]);
  const patient = patientRows[0];

  if (patient?.email) {
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

  return updatedConsultation;
};

// Delete consultation
export const deleteConsultation = async (id) => {
  const [result] = await db.query('DELETE FROM Consultations WHERE consultation_id = ?', [id]);
  if (!result.affectedRows) throw new Error('Consultation not found');
  return { message: 'Consultation deleted successfully' };
};
