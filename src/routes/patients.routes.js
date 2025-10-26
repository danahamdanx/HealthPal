import express from 'express';
import * as ctrl from '../controllers/patients.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// ✅ GET all patients (authenticated)
router.get('/', authenticate, ctrl.getAllPatients);

// ✅ GET single patient (authenticated)
router.get('/:id', authenticate, ctrl.getPatientById);

// ✅ POST new patient (admin only)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createPatient);

// ✅ PUT update patient (admin only)
router.put('/:id', authenticate, authorizeRoles('admin','patient'), ctrl.updatePatient);

// ✅ DELETE patient (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deletePatient);

export default router;
