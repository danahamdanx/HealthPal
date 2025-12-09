import express from 'express';
import * as ctrl from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.middleware.js';

const router = express.Router();

// ✅ GET all users (admin only)
router.get('/', authenticate, authorizeRoles('admin'), ctrl.getAllUsers);

router.get('/me', authenticate, ctrl.getMe);
// ✅ GET single user (authenticated)
router.get('/:id', authenticate, ctrl.getUserById);

// ✅ POST new user (admin only)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createUser);

router.post('/search', authenticate, authorizeRoles('admin'), ctrl.searchUserByEmailOrPhone); // البحث بالبريد/الهاتف


// ✅ PUT update user (admin only)
router.put('/:id', authenticate, authorizeRoles('admin'), ctrl.updateUser);

// ✅ DELETE user (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteUser);

export default router;
