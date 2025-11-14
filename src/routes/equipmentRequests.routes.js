// src/routes/equipmentRequests.routes.js
import express from "express";
import {
  createEquipmentRequest,
  claimEquipmentRequest,
  updateEquipmentRequestStatus
} from "../controllers/equipmentRequests.controller.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createEquipmentRequest);
router.post("/:id/claim", auth, claimEquipmentRequest);
router.patch("/:id/status", auth, updateEquipmentRequestStatus);

export default router;
