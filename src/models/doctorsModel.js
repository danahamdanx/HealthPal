import { db } from "../config/db.js";

export const Doctors = {

  // ===============================
  //           GET ALL
  // ===============================
  getAll: () => {
    return db.query("SELECT * FROM doctors");
  },

  // ===============================
  //           GET BY ID
  // ===============================
  getById: (id) => {
    return db.query("SELECT * FROM doctors WHERE doctor_id = ?", [id]);
  },

  // ===============================
  //           CREATE DOCTOR
  // ===============================
  create: (data) => {
    const {
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id
    } = data;

    return db.query(
      `INSERT INTO doctors 
      (name, phone, email, gender, qualification, hospital_name, address, specialty, 
       license_number, experience_years, availability, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, phone, email, gender, qualification,
        hospital_name, address, specialty, license_number,
        experience_years, availability, user_id
      ]
    );
  },

  // ===============================
  //           UPDATE DOCTOR
  // ===============================
  update: (id, data) => {
    const {
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id
    } = data;

    return db.query(
      `UPDATE doctors SET 
        name=?, phone=?, email=?, gender=?, qualification=?,
        hospital_name=?, address=?, specialty=?, license_number=?,
        experience_years=?, availability=?, user_id=?
       WHERE doctor_id=?`,
      [
        name, phone, email, gender, qualification,
        hospital_name, address, specialty, license_number,
        experience_years, availability, user_id, id
      ]
    );
  },

  // ===============================
  //           DELETE DOCTOR
  // ===============================
  delete: (id) => {
    return db.query("DELETE FROM doctors WHERE doctor_id=?", [id]);
  },

  // ===============================
  //   GET DOCTORS BY SPECIALTY
  // ===============================
  getBySpecialty: (specialty) => {
    return db.query(
      "SELECT * FROM doctors WHERE specialty = ? ORDER BY name ASC",
      [specialty]
    );
  },

  // ===============================
  //        DOCTOR SEARCH
  // ===============================
  search: (keyword) => {
    return db.query(
      `SELECT * FROM doctors
       WHERE name LIKE ?
       OR specialty LIKE ?
       OR hospital_name LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
  },

  // ===============================
  //       UPDATE VERIFICATION
  // ===============================
  updateVerificationStatus: (id, status) => {
    return db.query(
      "UPDATE doctors SET verification_status = ? WHERE doctor_id = ?",
      [status, id]
    );
  },

  // ===============================
  //       UPDATE FEE
  // ===============================
  updateConsultationFee: (id, fee) => {
    return db.query(
      "UPDATE doctors SET consultation_fee = ? WHERE doctor_id = ?",
      [fee, id]
    );
  },

  // ===============================
  //       RATING SUMMARY
  // ===============================
  getRatingSummary: (doctorId) => {
    return db.query(`
      SELECT 
        AVG(rating) AS avg_rating,
        COUNT(*) AS total_reviews,
        SUM(rating = 5) AS stars_5,
        SUM(rating = 4) AS stars_4,
        SUM(rating = 3) AS stars_3,
        SUM(rating = 2) AS stars_2,
        SUM(rating = 1) AS stars_1
      FROM doctor_reviews
      WHERE doctor_id = ?
    `, [doctorId]);
  },

  // ===============================
  //        DOCTOR STATS
  // ===============================
  getStats: (doctorId) => {
    const query1 = db.query(
      "SELECT COUNT(*) AS total_reviews FROM doctor_reviews WHERE doctor_id = ?",
      [doctorId]
    );

    const query2 = db.query(
      "SELECT COUNT(*) AS total_prescriptions FROM prescriptions WHERE doctor_id = ?",
      [doctorId]
    );

    return Promise.all([query1, query2]);
  }
};
