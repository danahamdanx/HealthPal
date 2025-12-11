import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { createTicket, getUserTickets, getAllTickets, updateStatus } from "../controllers/supportTickets.controller.js";

const router = express.Router();

// إنشاء تذكرة
router.post("/", authenticate, createTicket);

// عرض تذاكر المستخدم
router.get("/", authenticate, getUserTickets);

// عرض كل التذاكر (لأدمن)
router.get("/all", authenticate,authorizeRoles('admin'), getAllTickets);

// تحديث حالة تذكرة
router.patch("/:ticketId/status", authenticate,authorizeRoles('admin'), updateStatus);

export default router;
