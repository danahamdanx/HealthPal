import express from "express";
import {
  getPatientDashboard,
  getDoctorDashboard,
  getNgoDashboard,
  getDonorDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/patient", getPatientDashboard);
router.get("/doctor", getDoctorDashboard);
router.get("/ngo/:ngoId", getNgoDashboard);
router.get("/donor/:donorId", getDonorDashboard);

export default router;