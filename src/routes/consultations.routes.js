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

// ✅ Create a consultation (doctor or admin)
router.post('/', authenticate, authorizeRoles('doctor', 'admin','patient'), ctrl.createConsultation);

// ✅ Update consultation (doctor or admin)
router.put('/:id', authenticate, authorizeRoles('doctor', 'admin'), ctrl.updateConsultation);

// ✅ Delete consultation (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteConsultation);

export default router;
