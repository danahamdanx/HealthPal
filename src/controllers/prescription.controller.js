const Prescription = require("../models/prescription.model");

module.exports = {

    // إنشاء وصفة جديدة
    createPrescription: async (req, res) => {
        try {
            const doctorId = req.user.user_id; // assume user is doctor
            const { patientId, notes } = req.body;

            const [result] = await Prescription.createPrescription(doctorId, patientId, notes);

            res.status(201).json({
                message: "تم إنشاء الوصفة بنجاح",
                prescriptionId: result.insertId
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "خطأ أثناء إنشاء الوصفة" });
        }
    },

    // إضافة دواء للوصفة
    addMedicine: async (req, res) => {
        try {
            const { prescriptionId } = req.params;
            const { name, dosage, duration, instructions } = req.body;

            await Prescription.addMedicine(prescriptionId, name, dosage, duration, instructions);

            res.json({ message: "تمت إضافة الدواء للوصفة" });

        } catch {
            res.status(500).json({ error: "خطأ أثناء إضافة الدواء" });
        }
    },

    // عرض كل وصفات المستخدم
    getMyPrescriptions: async (req, res) => {
        try {
            const patientId = req.user.user_id;
            const [rows] = await Prescription.getPrescriptionByPatient(patientId);

            res.json(rows);

        } catch {
            res.status(500).json({ error: "خطأ أثناء جلب الوصفات" });
        }
    },

    // عرض تفاصيل وصفة معيّنة
    getPrescriptionDetails: async (req, res) => {
        try {
            const { prescriptionId } = req.params;
            const [rows] = await Prescription.getPrescriptionDetails(prescriptionId);

            res.json(rows);

        } catch {
            res.status(500).json({ error: "خطأ أثناء جلب تفاصيل الوصفة" });
        }
    },

    // تعديل حالة وصفة
    updateStatus: async (req, res) => {
        try {
            const { prescriptionId } = req.params;
            const { status } = req.body;

            const allowed = ["active", "expired", "cancelled"];
            if (!allowed.includes(status)) {
                return res.status(400).json({ error: "الحالة غير صالحة" });
            }

            await Prescription.updateStatus(prescriptionId, status);

            res.json({ message: "تم تعديل حالة الوصفة" });

        } catch {
            res.status(500).json({ error: "خطأ أثناء تحديث الحالة" });
        }
    }
};