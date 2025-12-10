// src/routes/ngoReports.routes.js
import { Router } from 'express';
import {
  getNgoSummaryReport,
  getNgoDonationsByMonthReport,
  getNgoTopCasesReport,
} from '../controllers/ngoReports.controller.js';
// لو عندك authMiddleware و allowRoles
// import { authMiddleware } from '../middleware/auth.middleware.js';
// import { allowRoles } from '../middleware/role.middleware.js';

const router = Router();

// مثال مع auth و role (اختياري):
// router.get('/:ngoId/reports/summary', authMiddleware, allowRoles('ngo', 'admin'), getNgoSummaryReport);

router.get('/:ngoId/reports/summary', getNgoSummaryReport);

router.get('/:ngoId/reports/donations-by-month', getNgoDonationsByMonthReport);

router.get('/:ngoId/reports/top-cases', getNgoTopCasesReport);

export default router;