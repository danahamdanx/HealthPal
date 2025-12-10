// src/routes/ngoReports.routes.js
import { Router } from 'express';
import {
  getNgoSummaryReport,
  getNgoDonationsByMonthReport,
  getNgoTopCasesReport,
} from '../controllers/ngoReports.controller.js';
// لو عندك authMiddleware و allowRoles
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = Router();


router.get('/:ngoId/reports/summary',authenticate,authorizeRoles('ngo','admin'), getNgoSummaryReport);

router.get('/:ngoId/reports/donations-by-month',authenticate,authorizeRoles('ngo','admin'), getNgoDonationsByMonthReport);

router.get('/:ngoId/reports/top-cases',authenticate,authorizeRoles('ngo','admin'), getNgoTopCasesReport);

export default router;