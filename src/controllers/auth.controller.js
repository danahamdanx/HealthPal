import * as authService from '../services/auth.service.js';

export const signup = async (req, res) => {
  try {
    const result = await authService.signupUser(req.body);
    res.status(201).json({ message: 'Signup successful', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ message: 'Login successful', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.logoutUser(token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If email exists, reset link sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
