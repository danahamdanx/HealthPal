import express from 'express';
import { signup, login,logout,forgotPassword,resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
