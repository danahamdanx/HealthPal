import { db } from '../config/db.js';

// ===============================
//   GET ALL DOCTORS
// ===============================
export const getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching doctors" });
  }
};

// ===============================
//   GET DOCTOR BY ID
// ===============================
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM doctors WHERE doctor_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching doctor" });
  }
};

// ===============================
//   CREATE DOCTOR
// ===============================
export const createDoctor = async (req, res) => {
  try {
    const {
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id
    } = req.body;

    const [result] = await db.query(
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

    res.status(201).json({ doctor_id: result.insertId, message: "Doctor created" });

  } catch (err) {
    res.status(500).json({ error: "Error creating doctor" });
  }
};

// ===============================
//   UPDATE DOCTOR
// ===============================
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, phone, email, gender, qualification,
      hospital_name, address, specialty, license_number,
      experience_years, availability, user_id
    } = req.body;

    const [result] = await db.query(
      `UPDATE doctors SET 
        name=?, phone=?, email=?, gender=?, qualification=?,
        hospital_name=?, address=?, specialty=?, license_number=?,
        experience_years=?, availability=?, user_id=?
       WHERE doctor_id=?`,
      [
        name, phone, email, gender, qualification, hospital_name,
        address, specialty, license_number, experience_years,
        availability, user_id, id
      ]
    );

    res.json({ message: "Doctor updated" });
  } catch (err) {
    res.status(500).json({ error: "Error updating doctor" });
  }
};

// ===============================
//   DELETE DOCTOR
// ===============================
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM doctors WHERE doctor_id=?", [id]);
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting doctor" });
  }
};

// ===============================
//   GET DOCTORS BY SPECIALTY
// ===============================
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;

    if (!specialty) {
      return res.status(400).json({ error: 'Specialty is required' });
    }

    const [rows] = await db.query(
      'SELECT * FROM doctors WHERE specialty = ? ORDER BY name ASC',
      [specialty]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching doctors by specialty' });
  }
};

// ===============================
//   RATING SUMMARY
// ===============================
export const getDoctorRatingSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
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
    `, [id]);

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Error fetching rating summary" });
  }
};

// ===============================
//   UPDATE DOCTOR VERIFICATION STATUS
// ===============================
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.query(
      "UPDATE doctors SET verification_status = ? WHERE doctor_id = ?",
      [status, id]
    );

    res.json({ message: "Verification status updated" });

  } catch (err) {
    res.status(500).json({ error: "Error updating verification status" });
  }
};

// ===============================
//   UPDATE CONSULTATION FEE
// ===============================
export const updateConsultationFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fee } = req.body;

    await db.query(
      "UPDATE doctors SET consultation_fee = ? WHERE doctor_id = ?",
      [fee, id]
    );

    res.json({ message: "Consultation fee updated" });

  } catch (err) {
    res.status(500).json({ error: "Error updating fee" });
  }
};

// ===============================
//   SEARCH DOCTOR
// ===============================
export const searchDoctors = async (req, res) => {
  try {
    const { keyword } = req.query;

    const [rows] = await db.query(
      `SELECT * FROM doctors 
       WHERE name LIKE ? 
       OR specialty LIKE ?
       OR hospital_name LIKE ?`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: "Error searching doctors" });
  }
};

// ===============================
//   DOCTOR STATS (DASHBOARD)
// ===============================
export const getDoctorStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [[rating]] = await db.query(
      "SELECT COUNT(*) AS total_reviews FROM doctor_reviews WHERE doctor_id = ?",
      [id]
    );

    const [[prescriptions]] = await db.query(
      "SELECT COUNT(*) AS total_prescriptions FROM prescriptions WHERE doctor_id = ?",
      [id]
    );

    res.json({
      total_reviews: rating.total_reviews,
      total_prescriptions: prescriptions.total_prescriptions,
    });

  } catch (err) {
    res.status(500).json({ error: "Error fetching doctor stats" });
  }
};