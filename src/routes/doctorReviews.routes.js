const express = require("express");
const router = express.Router();

// استدعاء الكنترولر
const doctorReviewsController = require("../controllers/doctorReviews.controller");

// ميدل وير التحقق (لو عندك JWT / Auth)
const auth = require("../middleware/auth");

// ==============================
//    ROUTES FOR DOCTOR REVIEWS
// ==============================

// إضافة تقييم جديد لجلسة معيّنة
router.post("/:sessionId", auth, doctorReviewsController.addReview);

// الحصول على كل التقييمات لدكتور معيّن
router.get("/doctor/:doctorId", auth, doctorReviewsController.getDoctorReviews);

// جلب متوسط تقييم الدكتور و عدد التقييمات
router.get("/doctor/:doctorId/summary", auth, doctorReviewsController.getDoctorRatingSummary);

// جلب تقييم جلسة معيّنة (إن وجد)
router.get("/session/:sessionId", auth, doctorReviewsController.getSessionReview);

module.exports = router;