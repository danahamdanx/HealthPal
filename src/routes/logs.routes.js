// src/routes/logs.routes.js
import express from "express";
import { getAllLogs } from "../controllers/logs.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = express.Router();

// Admin can view logs
router.get("/", authenticate, authorizeRoles("admin"), getAllLogs);

export default router;
