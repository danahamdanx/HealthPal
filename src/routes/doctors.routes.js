import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsBySpecialty,
  getDoctorRatingSummary,
  updateVerificationStatus,
  updateConsultationFee,
  searchDoctors,
  getDoctorStats
} from '../controllers/doctors.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// =========================
//       DOCTOR CRUD
// =========================

// Get all doctors
router.get('/', authenticate, getAllDoctors);

// Get doctors by specialty
router.get('/by-specialty', authenticate, getDoctorsBySpecialty);

// Search doctors
router.get('/search/by', authenticate, searchDoctors);

// Get doctor by ID
router.get('/:id', authenticate, getDoctorById);

// Create doctor (Admin only)
router.post('/', authenticate, authorizeRoles('admin'), createDoctor);

// Update doctor (Admin + Doctor)
router.put('/:id', authenticate, authorizeRoles('admin', 'doctor'), updateDoctor);

// Delete doctor (Admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteDoctor);


// =========================
//    DOCTOR EXTRA FEATURES
// =========================

// Rating summary
router.get('/:id/rating-summary', authenticate, getDoctorRatingSummary);

// Update verification status (Admin only)
router.patch('/:id/verify', authenticate, authorizeRoles('admin'), updateVerificationStatus);

// Update consultation fee (Admin + Doctor)
router.patch('/:id/fee', authenticate, authorizeRoles('admin', 'doctor'), updateConsultationFee);

// Doctor stats
router.get('/:id/stats', authenticate, getDoctorStats);


export default router;