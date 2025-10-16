import express from 'express';
import * as ctrl from '../controllers/users.controller.js';

const router = express.Router();

// ✅ GET all users
router.get('/', ctrl.getAllUsers);

// ✅ GET single user
router.get('/:id', ctrl.getUserById);

// ✅ POST new user
router.post('/', ctrl.createUser);

// ✅ PUT update user
router.put('/:id', ctrl.updateUser);

// ✅ DELETE user
router.delete('/:id', ctrl.deleteUser);

// ✅ Export router (ESM way)
export default router;
