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
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/",authenticate, authorizeRoles("admin","ngo","donor"), createEquipment);

router.get("/",authenticate, authorizeRoles("admin","patient","ngo","donor"), getAllEquipment);

router.get("/:id",authenticate, authorizeRoles("admin","ngo","donor","patient"), getEquipmentById);

router.put("/:id",authenticate, authorizeRoles("admin","ngo","donor"), updateEquipment);

router.delete("/:id",authenticate, authorizeRoles("admin","ngo","donor"), deleteEquipment);


export default router;
