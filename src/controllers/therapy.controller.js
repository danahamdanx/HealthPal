import { db } from "../config/db.js";

/* ---------------------------------------------------
   Get all doctors that provide therapy sessions
--------------------------------------------------- */
export const getTherapyDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT doctor_id, user_id, specialty, bio, years_experience
      FROM Doctors
      WHERE specialty = 'therapy'
    `);

    res.json(doctors);

  } catch (err) {
    console.error("Error fetching therapy doctors:", err);
    res.status(500).json({ error: "Error fetching therapy doctors" });
  }
};