import { db } from '../config/db.js';

export const getAllPatients = async () => {
  const [rows] = await db.query(`SELECT * FROM patients`);
  return rows;
};

export const getPatientById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM patients WHERE patient_id=$1`, [id]);
  return rows[0];
};

export const createPatient = async (data) => {
  const {
    name, email, date_of_birth, gender, blood_type,
    address, phone, medical_history, user_id
  } = data;

  const [rows] = await db.query(
    `INSERT INTO patients 
    (name, email, date_of_birth, gender, blood_type, address, phone, medical_history, user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      name, email, date_of_birth, gender, blood_type,
      address, phone, medical_history, user_id
    ]
  );

  return rows[0];
};

export const updatePatient = async (id, data) => {
  const {
    name, email, date_of_birth, gender, blood_type,
    address, phone, medical_history, user_id
  } = data;

  const [rows] = await db.query(
    `UPDATE patients SET 
      name=$1, email=$2, date_of_birth=$3, gender=$4, blood_type=$5,
      address=$6, phone=$7, medical_history=$8, user_id=$9
    WHERE patient_id=$10 RETURNING *`,
    [
      name, email, date_of_birth, gender, blood_type,
      address, phone, medical_history, user_id, id
    ]
  );

  return rows[0];
};

export const deletePatient = async (id) => {
  await db.query(`DELETE FROM patients WHERE patient_id=$1`, [id]);
  return true;
};
