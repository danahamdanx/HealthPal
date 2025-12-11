// src/routes/medicalRequestPriority.routes.js
import { Router } from 'express';
import { getPrioritizedMedicalRequests } from '../controllers/medicalRequestPriority.controller.js';
// لو عندك auth / roles:
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = Router();

// GET /api/medical-requests/prioritized
router.get(
  '/prioritized',
  authenticate,
  authorizeRoles('ngo', 'admin'),
  getPrioritizedMedicalRequests
);

export default router;