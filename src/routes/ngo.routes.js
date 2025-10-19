import express from "express";
import * as ctrl from "../controllers/ngo.controller.js";
import { authenticate } from "../middleware/authenticate.js"; // 🔒 import middleware

const router = express.Router();

// 🔒 Protect all NGO routes
router.get("/", ctrl.getAllNgos);
router.get("/:id", ctrl.getNgoById);

router.post("/", authenticate, ctrl.createNgo);
router.put("/:id", authenticate, ctrl.updateNgo);
router.delete("/:id", authenticate, ctrl.deleteNgo);

export default router;
