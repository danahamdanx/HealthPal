import { addMedicine, getByConsultation } from '../services/consultationMedicine.service.js';

export const addMedicineController = async (req, res) => {
  try {
    const doctorName = req.user.name;
    const { consultationId } = req.params;
    const { name, dosage, duration, instructions, patientEmail, patientName } = req.body;

    await addMedicine(
      consultationId,
      doctorName,
      patientEmail,
      patientName,
      name,
      dosage,
      duration,
      instructions
    );

    res.status(201).json({ message: "Medicine added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding medicine" });
  }
};

export const getMedicinesController = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const [rows] = await getByConsultation(consultationId);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching medicines" });
  }
};
