// src/routes/sponsorships.routes.js
import express from 'express';
import { sponsorshipsController } from '../controllers/sponsorships.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.get('/', authenticate, sponsorshipsController.getAll);
router.get('/:id', authenticate, sponsorshipsController.getById);
router.post('/', authenticate, authorizeRoles('admin', 'ngo'), sponsorshipsController.create);
router.put('/:id', authenticate, authorizeRoles('admin', 'ngo'), sponsorshipsController.update);
router.delete('/:id', authenticate, authorizeRoles('admin'), sponsorshipsController.delete);

export default router;
