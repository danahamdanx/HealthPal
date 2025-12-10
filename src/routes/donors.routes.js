import express from 'express';
import { donorsController } from '../controllers/donors.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin', 'ngo'), donorsController.getAll);
router.get('/:id', authenticate, donorsController.getById);
router.post('/', authenticate, authorizeRoles('admin', 'donor'), donorsController.create);
router.put('/:id', authenticate, authorizeRoles('admin', 'donor'), donorsController.update);
router.delete('/:id', authenticate, authorizeRoles('admin'), donorsController.delete);

export default router;
