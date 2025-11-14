// src/routes/equipmentInventory.routes.js
import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} from "../controllers/equipmentInventory.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createEquipment);
router.get("/", auth, getAllEquipment);
router.get("/:id", auth, getEquipmentById);
router.put("/:id", auth, updateEquipment);
router.delete("/:id", auth, deleteEquipment);

export default router;
