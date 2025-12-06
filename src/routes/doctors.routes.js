import express from 'express';
import * as ctrl from '../controllers/doctors.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// ✅ GET all doctors (authenticated)
router.get('/', authenticate, ctrl.getAllDoctors);

// ✅ GET single doctor (authenticated)
// GET doctors by specialty (must come BEFORE /:id)
router.get('/by-specialty', authenticate, ctrl.getDoctorsBySpecialty);

// GET single doctor by ID
router.get('/:id', authenticate, ctrl.getDoctorById);




// ✅ POST new doctor (admin only)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createDoctor);

// ✅ PUT update doctor (admin only)
router.put('/:id', authenticate, authorizeRoles('admin','doctor'), ctrl.updateDoctor);

// ✅ DELETE doctor (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteDoctor);

export default router;
