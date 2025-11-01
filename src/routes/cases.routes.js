import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { createCase, getAllCases, verifyCase } from '../controllers/cases.controller.js';

const router = express.Router();

// Get all cases
router.get('/', authenticate, getAllCases);

// Create a new case (Patient or Admin)
router.post('/', authenticate, authorizeRoles('patient', 'admin'), createCase);

// Verify a case (NGO assigned or Admin)
router.put('/:case_id/verify', authenticate, authorizeRoles('ngo', 'admin'), verifyCase);

export default router;
