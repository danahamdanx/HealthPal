import express from "express";
import {
  createHealthGuide, getHealthGuides,
  createPublicHealthAlert, getPublicHealthAlerts,
  createHealthWorkshop, getHealthWorkshops
} from "../controllers/healthEducation.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = express.Router();

/* Health Guides */
router.get("/guides", getHealthGuides);
router.post("/guides", authenticate, authorizeRoles("admin"), createHealthGuide);

/* Public Health Alerts */
router.get("/alerts", getPublicHealthAlerts);
router.post("/alerts", authenticate, authorizeRoles("admin", "ngo"), createPublicHealthAlert);

/* Workshops */
router.get("/workshops", getHealthWorkshops);
router.post("/workshops", authenticate, authorizeRoles("admin", "ngo"), createHealthWorkshop);

export default router;
