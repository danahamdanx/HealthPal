// src/routes/dashboard.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import {
  getPatientDashboard,
  getDoctorDashboard,
} from '../controllers/dashboard.controller.js';


const router = Router();

router.get('/patient', authenticate, authorizeRoles('patient'), getPatientDashboard);
router.get('/doctor', authenticate, authorizeRoles('doctor'), getDoctorDashboard);

export default router;