const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const supportTicketsController = require("../controllers/supportTickets.controller");

// إنشاء تذكرة
router.post("/", auth, supportTicketsController.createTicket);

// عرض تذاكر المستخدم
router.get("/", auth, supportTicketsController.getUserTickets);

// عرض كل التذاكر (لو بدك تتحكم بالصلاحيات)
router.get("/all", auth, supportTicketsController.getAllTickets);

// تحديث حالة تذكرة
router.patch("/:ticketId/status", auth, supportTicketsController.updateStatus);

module.exports = router;