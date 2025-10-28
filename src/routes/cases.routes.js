// src/routes/cases.routes.js
import express from 'express';
import { casesController } from '../controllers/cases.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.get('/', authenticate, casesController.getAll);
router.get('/:id', authenticate, casesController.getById);
router.post('/', authenticate, authorizeRoles('admin', 'ngo'), casesController.create);
router.put('/:id', authenticate, authorizeRoles('admin', 'ngo'), casesController.update);
router.delete('/:id', authenticate, authorizeRoles('admin'), casesController.delete);

export default router;
