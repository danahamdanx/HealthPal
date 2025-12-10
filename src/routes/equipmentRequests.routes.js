// src/routes/equipmentRequests.routes.js
import express from "express";
import {
  createEquipmentRequest,
  claimEquipmentRequest,
  updateEquipmentRequestStatus,
  deleteEquipmentRequest
} from "../controllers/equipmentRequests.controller.js";

import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/",authenticate, authorizeRoles("patient"), createEquipmentRequest);
router.post("/:id/claim",authenticate, authorizeRoles("admin","ngo","donor"), claimEquipmentRequest);
router.patch("/:id/status",authenticate, authorizeRoles("admin","ngo","donor"), updateEquipmentRequestStatus);
router.delete("/:id",authenticate, authorizeRoles("patient","admin"), deleteEquipmentRequest);

export default router;
