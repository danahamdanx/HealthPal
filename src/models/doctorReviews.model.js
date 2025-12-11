const db = require("../config/db"); // نفس ملف الاتصال عندك

const DoctorReviews = {
    
    // إضافة تقييم جديد
    addReview: async (sessionId, doctorId, patientId, rating, comment) => {
        const query = `
            INSERT INTO doctor_reviews (session_id, doctor_id, patient_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            sessionId,
            doctorId,
            patientId,
            rating,
            comment
        ]);

        return result;
    },

    // جلب تقييمات الدكتور
    getDoctorReviews: async (doctorId) => {
        const query = `
            SELECT r.*, p.name AS patient_name
            FROM doctor_reviews r
            JOIN patients p ON r.patient_id = p.patient_id
            WHERE r.doctor_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.execute(query, [doctorId]);
        return rows;
    },

    // ملخص تقييم الدكتور
    getDoctorRatingSummary: async (doctorId) => {
        const query = `
            SELECT 
                AVG(rating) AS avg_rating,
                COUNT(*) AS total_reviews
            FROM doctor_reviews
            WHERE doctor_id = ?
        `;
        const [rows] = await db.execute(query, [doctorId]);
        return rows[0];
    },

    // جلب تقييم جلسة معينة
    getSessionReview: async (sessionId) => {
        const query = `
            SELECT *
            FROM doctor_reviews
            WHERE session_id = ?
        `;
        const [rows] = await db.execute(query, [sessionId]);
        return rows[0];
    }
};

module.exports = DoctorReviews;