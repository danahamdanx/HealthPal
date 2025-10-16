import express from 'express';
import * as ctrl from '../controllers/doctors.controller.js';

const router = express.Router();

// ✅ GET all Doctor
router.get('/', ctrl.getAllDoctors);

// ✅ GET single Doctor
router.get('/:id', ctrl.getDoctorById);

// ✅ POST new Doctor
router.post('/', ctrl.createDoctor);

// ✅ PUT update Doctor
router.put('/:id', ctrl.updateDoctor);

// ✅ DELETE Doctor
router.delete('/:id', ctrl.deleteDoctor);

// ✅ Export router
export default router;
