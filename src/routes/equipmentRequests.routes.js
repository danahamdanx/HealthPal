// src/routes/equipmentRequests.routes.js
import express from "express";
import {
  createEquipmentRequest,
  claimEquipmentRequest,
  updateEquipmentRequestStatus
} from "../controllers/equipmentRequests.controller.js";

import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post("/", authorizeRoles, createEquipmentRequest);
router.post("/:id/claim", authorizeRoles, claimEquipmentRequest);
router.patch("/:id/status", authorizeRoles, updateEquipmentRequestStatus);

export default router;
