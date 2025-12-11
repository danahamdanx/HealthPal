import express from "express";
import {
  getTherapyDoctors,
  createTherapySession,
  getPatientTherapySessions,
  getDoctorTherapySessions,
  updateTherapySessionStatus,
  updateTherapySessionNotes
} from "../controllers/therapy.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = express.Router();

/* ---------------------------------------------------
   Get all doctors who offer therapy
   Roles: patient, doctor, admin, ngo, donor
--------------------------------------------------- */
router.get(
  "/doctors",
  authenticate,
  authorizeRoles("patient", "doctor", "admin", "ngo", "donor"),
  getTherapyDoctors
);

/* ---------------------------------------------------
   Create a new therapy session (booking)
   Role: patient only
--------------------------------------------------- */
router.post(
  "/",
  authenticate,
  authorizeRoles("patient"),
  createTherapySession
);

/* -------------------------------------------
   Get all sessions for logged-in patient
   Roles: patient only
-------------------------------------------- */
router.get(
  "/patient/sessions",
  authenticate,
  authorizeRoles("patient"),
  getPatientTherapySessions
);

/* ---------------------------------------------------
   Get all therapy sessions for the logged-in doctor
   Role: doctor only
--------------------------------------------------- */
router.get(
  "/doctor/sessions",
  authenticate,
  authorizeRoles("doctor"),
  getDoctorTherapySessions
);

/* ---------------------------------------------------
   Update session status (approved, rejected, completed, canceled)
   Roles: doctor, admin
--------------------------------------------------- */
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("doctor", "admin"),
  updateTherapySessionStatus
);

router.patch(
  "/:id/notes",
  authenticate,
  authorizeRoles("doctor"),
  updateTherapySessionNotes
);

export default router;