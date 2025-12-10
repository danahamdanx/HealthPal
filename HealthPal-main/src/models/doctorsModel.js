import { db } from '../config/db.js';

export const getAllDoctors = async () => {
  const [rows] = await db.query(`SELECT * FROM doctors`);
  return rows;
};

export const getDoctorById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM doctors WHERE doctor_id=$1`, [id]);
  return rows[0];
};

export const createDoctor = async (data) => {
  const {
    name, phone, email, gender, qualification,
    hospital_name, address, specialty, license_number,
    experience_years, availability, user_id
  } = data;

  const [rows] = await db.query(
    `INSERT INTO doctors 
    (name, phone, email, gender, qualification, hospital_name, address, specialty,
     license_number, experience_years, availability, user_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id
    ]
  );

  return rows[0];
};

export const updateDoctor = async (id, data) => {
  const {
    name, phone, email, gender, qualification,
    hospital_name, address, specialty, license_number,
    experience_years, availability, user_id
  } = data;

  const [rows] = await db.query(
    `UPDATE doctors SET 
      name=$1, phone=$2, email=$3, gender=$4, qualification=$5,
      hospital_name=$6, address=$7, specialty=$8,
      license_number=$9, experience_years=$10,
      availability=$11, user_id=$12
    WHERE doctor_id=$13 RETURNING *`,
    [
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id,
      id
    ]
  );

  return rows[0];
};

export const deleteDoctor = async (id) => {
  await db.query(`DELETE FROM doctors WHERE doctor_id=$1`, [id]);
  return true;
};
