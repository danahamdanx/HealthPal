import express from "express";
import {
  getTherapyDoctors,
  createTherapySession,
  getPatientTherapySessions,
  getDoctorTherapySessions,
  updateTherapySessionStatus
} from "../controllers/therapy.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = express.Router();

/* -------------------------------------------
   Get all therapy doctors
   Roles: patient, admin, ngo, donor
-------------------------------------------- */
router.get(
  "/doctors",
  authenticate,
  authorizeRoles("patient", "admin", "ngo", "donor"),
  getTherapyDoctors
);