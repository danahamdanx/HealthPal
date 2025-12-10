import express from "express";
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import {
  getPatientDashboard,
  getDoctorDashboard,
  getNgoDashboard,
  getDonorDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/patient",authenticate ,authorizeRoles('patient'),getPatientDashboard);
router.get("/doctor",authenticate ,authorizeRoles('doctor'),getDoctorDashboard);
router.get("/ngo",authenticate,authorizeRoles('ngo'), getNgoDashboard);
router.get("/donor",authenticate,authorizeRoles('donor'), getDonorDashboard);


export default router;