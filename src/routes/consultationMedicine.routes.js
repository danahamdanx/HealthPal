import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { addMedicineController, getMedicinesController } from '../controllers/consultationMedicine.controller.js';

const router = express.Router();

// إضافة دواء لاستشارة (فقط للطبيب)
router.post("/:consultationId/medicine", authenticate, authorizeRoles('doctor'), addMedicineController);

// جلب كل أدوية الاستشارة (الطبيب المعالج أو المريض المعني)
router.get("/:consultationId/medicines", authenticate, authorizeRoles('doctor', 'patient'), getMedicinesController);

export default router;
