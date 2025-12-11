import express from 'express';
import { createDonation } from '../controllers/donations.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';
import { 
  getCaseDonationsSummary
} from '../controllers/donations.controller.js';
const router = express.Router();

router.get(
  '/case/:caseId',
  authenticate,
  authorizeRoles('admin', 'ngo'),
  getCaseDonationsSummary
);

router.post('/', authenticate, authorizeRoles('donor', 'admin'), createDonation);

export default router;
