// src/routes/equipmentInventory.routes.js
import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} from "../controllers/equipmentInventory.controller.js";
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post("/", authorizeRoles, createEquipment);
router.get("/", authorizeRoles, getAllEquipment);
router.get("/:id", authorizeRoles, getEquipmentById);
router.put("/:id", authorizeRoles, updateEquipment);
router.delete("/:id", authorizeRoles, deleteEquipment);

export default router;
