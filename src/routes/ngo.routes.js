import express from 'express';
import * as ctrl from '../controllers/ngo.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// ✅ GET all NGOs (authenticated)
router.get('/', authenticate, ctrl.getAllNgos);

// ✅ GET single NGO (authenticated)
router.get('/:id', authenticate, ctrl.getNgoById);

// ✅ POST new NGO (admin only)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createNgo);

// ✅ PUT update NGO (admin only)
router.put('/:id', authenticate, authorizeRoles('admin'), ctrl.updateNgo);

// ✅ DELETE NGO (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteNgo);

export default router;
