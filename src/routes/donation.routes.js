import express from 'express';
import { createDonation } from '../controllers/donations.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { 
  createDonation, 
  getMyDonations,
  getCaseDonationsSummary
} from '../controllers/donations.controller.js';

// ...

// ملخص التبرعات لحالة معينة (admin أو NGO)
router.get(
  '/case/:caseId',
  authenticate,
  authorizeRoles('admin', 'ngo'),
  getCaseDonationsSummary
);
const router = express.Router();

router.post('/', authenticate, authorizeRoles('donor', 'admin'), createDonation);

export default router;
