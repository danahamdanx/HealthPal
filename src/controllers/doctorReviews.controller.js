const DoctorReviews = require("../models/doctorReviews.model");
const db = require("../config/db");

// لجل نقدر نتأكد من نوع المستخدم و session والربط
const TherapySessions = require("../models/therapySessions.model"); // لو عندك موديل الجلسات

module.exports = {

    // =============================
    // إضافة تقييم جديد
    // =============================
    addReview: async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.user_id; // من التوكن

            // 1) نجيب بيانات الجلسة
            const [sessionRows] = await db.execute(
                "SELECT * FROM therapysessions WHERE session_id = ?",
                [sessionId]
            );

            if (sessionRows.length === 0) {
                return res.status(404).json({ message: "Session not found" });
            }

            const session = sessionRows[0];

            // 2) نتحقق إن المستخدم هو المريض
            if (session.patient_id !== userId) {
                return res.status(403).json({ message: "Not allowed" });
            }

            // 3) نضيف التقييم
            await DoctorReviews.addReview(
                sessionId,
                session.doctor_id,
                session.patient_id,
                rating,
                comment
            );

            res.status(201).json({ message: "Review added successfully" });

        } catch (error) {
            console.error(error);
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "Already reviewed this session" });
            }
            res.status(500).json({ message: "Server error" });
        }
    },

    // =============================
    // جلب تقييمات الدكتور
    // =============================
    getDoctorReviews: async (req, res) => {
        try {
            const { doctorId } = req.params;

            const reviews = await DoctorReviews.getDoctorReviews(doctorId);

            res.json(reviews);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    },

    // =============================
    // ملخص تقييم الدكتور
    // =============================
    getDoctorRatingSummary: async (req, res) => {
        try {
            const { doctorId } = req.params;

            const summary = await DoctorReviews.getDoctorRatingSummary(doctorId);

            res.json(summary);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    },

    // =============================
    // تقييم الجلسة (إن وجد)
    // =============================
    getSessionReview: async (req, res) => {
        try {
            const { sessionId } = req.params;

            const review = await DoctorReviews.getSessionReview(sessionId);

            if (!review) {
                return res.status(404).json({ message: "No review found" });
            }

            res.json(review);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
};