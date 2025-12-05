import express from "express";
import {
  createHealthGuide,
  createPublicHealthAlert, getPublicHealthAlerts,
} from "../controllers/healthEducation.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = express.Router();

/* Health Guides */
router.post("/guides", authenticate, authorizeRoles("admin"), createHealthGuide);

/* Public Health Alerts */
router.get("/alerts", getPublicHealthAlerts);
router.post("/alerts", authenticate, authorizeRoles("admin", "ngo"), createPublicHealthAlert);

export default router;
