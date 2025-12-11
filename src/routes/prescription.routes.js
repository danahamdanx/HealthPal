const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const prescriptionController = require("../controllers/prescription.controller");

// إنشاء وصفة جديدة
router.post("/", auth, prescriptionController.createPrescription);

// إضافة دواء داخل الوصفة
router.post("/:prescriptionId/medicine", auth, prescriptionController.addMedicine);

// عرض وصفات المستخدم
router.get("/", auth, prescriptionController.getMyPrescriptions);

// عرض وصفة كاملة
router.get("/:prescriptionId", auth, prescriptionController.getPrescriptionDetails);

// تعديل حالة الوصفة
router.patch("/:prescriptionId/status", auth, prescriptionController.updateStatus);

module.exports = router;