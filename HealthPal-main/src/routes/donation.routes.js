import express from 'express';
import { createDonation } from '../controllers/donations.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('donor', 'admin'), createDonation);

export default router;
