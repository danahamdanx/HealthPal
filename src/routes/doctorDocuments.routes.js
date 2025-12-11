import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  uploadDoctorDocument,
  getDoctorDocuments,
  deleteDoctorDocument
} from "../controllers/doctorDocuments.controller.js";

const router = express.Router();

// Add document
router.post("/:doctorId", authenticate, uploadDoctorDocument);

// Get documents for doctor
router.get("/:doctorId", authenticate, getDoctorDocuments);

// Delete document
router.delete("/:documentId", authenticate, deleteDoctorDocument);

export default router;