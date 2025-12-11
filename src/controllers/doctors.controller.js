import { createCrudController } from './crud.controller.js';
import { db } from '../config/db.js'; // Make sure you have access to your DB connection

export const {
  getAll: getAllDoctors,
  getById: getDoctorById,
  create: createDoctor,
  update: updateDoctor,
  delete: deleteDoctor
} = createCrudController(
  'Doctors',
  'doctor_id',
  ['name', 'phone', 'email', 'gender', 'qualification', 'hospital_name', 'address', 'specialty', 'license_number', 'experience_years', 'availability']
);

// ✅ Custom function: Get doctors by category
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query; // e.g., ?specialty=Cardiology

    if (!specialty) {
      return res.status(400).json({ error: 'Specialty is required' });
    }

    const [rows] = await db.query(
      'SELECT * FROM Doctors WHERE specialty = ? ORDER BY name ASC',
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
