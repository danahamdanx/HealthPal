// src/routes/medicalRequests.routes.js
import express from 'express';
import * as ctrl from '../controllers/medicalRequests.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Create a request (patient)
router.post('/', authenticate, authorizeRoles('patient', 'admin'), ctrl.createMedicalRequest);

// Marketplace: get all requests (ngos, donors, admin, patient see own)
router.get('/', authenticate, ctrl.getAllMedicalRequests);

// Get single request
router.get('/:id', authenticate, ctrl.getMedicalRequestById);

// Claim a request (NGO or Donor or admin)
router.post('/:id/claim', authenticate, authorizeRoles('ngo','donor','admin'), ctrl.claimMedicalRequest);

// Update status (only claimant or admin)
router.put('/:id/status', authenticate, authorizeRoles('ngo','donor','admin','admin'), ctrl.updateMedicalRequestStatus);

// Cancel claim (claimant or admin)
router.post('/:id/cancel', authenticate, authorizeRoles('ngo','donor','admin'), ctrl.cancelClaim);

export default router;
