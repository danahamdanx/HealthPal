import express from 'express';
import * as ctrl from '../controllers/patients.controller.js';
import { authenticate } from "../middleware/authenticate.js"; // 🔒 import middleware


const router = express.Router();

// ✅ GET all patients
router.get('/', ctrl.getAllPatients);

// ✅ GET single patient
router.get('/:id', ctrl.getPatientById);

// ✅ POST new patient
router.post('/',authenticate, ctrl.createPatient);

// ✅ PUT update patient
router.put('/:id',authenticate, ctrl.updatePatient);

// ✅ DELETE patient
router.delete('/:id',authenticate, ctrl.deletePatient);

// ✅ Export router
export default router;
