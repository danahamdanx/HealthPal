// src/routes/consultations.routes.js
import express from 'express';
import * as ctrl from '../controllers/consultations.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// ✅ Get all consultations (admin or doctor)
router.get('/', authenticate, ctrl.getAllConsultations);

// ✅ Get one consultation
router.get('/:id', authenticate, ctrl.getConsultationById);

// ✅ Create a consultation (doctor or admin or patient)
router.post('/', authenticate, authorizeRoles('admin','patient'), ctrl.createConsultation);

// ⭐ جديد: فحص تضارب المواعيد قبل الحجز
// body: { patient_id, doctor_id, scheduled_time }
router.post('/check-conflict', authenticate, authorizeRoles('admin','doctor','patient'), ctrl.checkConsultationConflict);

// ✅ Update consultation (doctor or admin or patient)
router.put('/:id', authenticate, authorizeRoles('doctor', 'admin','patient'), ctrl.updateConsultation);

// ✅ Update only status
router.patch('/:id/status', authenticate, authorizeRoles('doctor', 'admin'), ctrl.updateConsultationStatus);

// ✅ Delete consultation (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteConsultation);

export default router;