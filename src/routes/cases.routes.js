import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import * as casesController from '../controllers/cases.controller.js';

const router = express.Router();

// إنشاء حالة جديدة (أي مستخدم مسجّل دخول)
router.post('/', authenticate, casesController.createCase);

// التحقق من حالة (NGO أو admin)
router.patch(
  '/verify/:case_id',
  authenticate,
  authorizeRoles('admin', 'ngo'),
  casesController.verifyCase
);

// جلب جميع الحالات (أي مستخدم مسجّل دخول)
router.get('/', authenticate, casesController.getAllCases);

// جلب حالة واحدة حسب ID (أي مستخدم مسجّل دخول)
router.get('/:case_id', authenticate, casesController.getCaseById);

// تحديث حالة (admin أو NGO صاحب الحالة)
router.put(
  '/:case_id',
  authenticate,
  authorizeRoles('admin', 'ngo'),
  casesController.updateCase
);

// حذف حالة (admin فقط)
router.delete(
  '/:case_id',
  authenticate,
  authorizeRoles('admin','patient'),
  casesController.deleteCase
);

export default router;
