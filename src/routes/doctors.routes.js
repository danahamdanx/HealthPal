import express from "express";
import * as ctrl from "../controllers/doctors.controller.js";
import { authenticate } from "../middleware/authenticate.js"; // 🔒 import middleware

const router = express.Router();

// 🔒 Protect all Doctor routes
router.get("/",ctrl.getAllDoctors);
router.get("/:id", ctrl.getDoctorById);

router.post("/", authenticate, ctrl.createDoctor);
router.put("/:id", authenticate, ctrl.updateDoctor);
router.delete("/:id", authenticate, ctrl.deleteDoctor);

export default router;
