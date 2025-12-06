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
export const getDoctorsByCategory = async (req, res) => {
  try {
    const { category, value } = req.query; // e.g., ?category=specialty&value=Cardiology

    if (!category || !value) {
      return res.status(400).json({ error: 'Category and value are required' });
    }

    // Optional: validate allowed columns to prevent SQL injection
    const allowedColumns = ['specialty', 'hospital_name', 'gender', 'qualification'];
    if (!allowedColumns.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const [rows] = await db.query(`SELECT * FROM Doctors WHERE ${category} = ? ORDER BY name ASC`, [value]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching doctors by category' });
  }
};
