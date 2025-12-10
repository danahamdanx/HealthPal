import { db } from '../config/db.js';

export const getAllConsultations = async () => {
  const [rows] = await db.query(`SELECT * FROM consultations`);
  return rows;
};

export const getConsultationById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM consultations WHERE consultation_id=$1`,
    [id]
  );
  return rows[0];
};

export const createConsultation = async (data) => {
  const {
    patient_id, doctor_id, scheduled_time, status,
    consultation_type, translation_needed, notes,
    diagnosis, treatment
  } = data;

  const [rows] = await db.query(
    `INSERT INTO consultations 
    (patient_id, doctor_id, scheduled_time, status, consultation_type,
     translation_needed, notes, diagnosis, treatment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      patient_id, doctor_id, scheduled_time, status,
      consultation_type, translation_needed, notes,
      diagnosis, treatment
    ]
  );

  return rows[0];
};

export const updateConsultation = async (id, data) => {
  const {
    patient_id, doctor_id, scheduled_time, status,
    consultation_type, translation_needed, notes,
    diagnosis, treatment
  } = data;

  const [rows] = await db.query(
    `UPDATE consultations SET
      patient_id=$1, doctor_id=$2, scheduled_time=$3, status=$4,
      consultation_type=$5, translation_needed=$6, notes=$7,
      diagnosis=$8, treatment=$9
      WHERE consultation_id=$10 RETURNING *`,
    [
      patient_id, doctor_id, scheduled_time, status,
      consultation_type, translation_needed, notes,
      diagnosis, treatment,
      id
    ]
  );

  return rows[0];
};

export const deleteConsultation = async (id) => {
  await db.query(`DELETE FROM consultations WHERE consultation_id=$1`, [id]);
  return true;
};
