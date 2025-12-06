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
    console.error(err);
    res.status(500).json({ error: 'Database error fetching doctors by specialty' });
  }
};
