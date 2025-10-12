import express from 'express';
import * as ctrl from '../controllers/patients.controller.js';

const router = express.Router();

// ✅ GET all patients
router.get('/', ctrl.getAllPatients);

// ✅ GET single patient
router.get('/:id', ctrl.getPatientById);

// ✅ POST new patient
router.post('/', ctrl.createPatient);

// ✅ PUT update patient
router.put('/:id', ctrl.updatePatient);

// ✅ DELETE patient
router.delete('/:id', ctrl.deletePatient);

// ✅ Export router
export default router;
