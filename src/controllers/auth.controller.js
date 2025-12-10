import * as authService from '../services/auth.service.js';

export const signup = async (req, res) => {
  try {
    const result = await authService.signupUser(req.body);

    await createLog({
      user_id: result.user.user_id,
      action: 'SIGNUP_SUCCESS',
      status_code: 201,
      message:'New ${result.user.role} registered '  
    });

    res.status(201).json({ message: 'Signup successful', ...result });
  } catch (err) {
    await createLog({
      user_id: null,
      action: 'SIGNUP_FAILED',
      status_code: 400,
      message: err.message
    });

    res.status(400).json({ error: err.message });
  }
};
export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    await createLog({
      user_id: result.user.user_id,
      action: 'LOGIN_SUCCESS',
      status_code: 200,
      message: 'User logged in'
    });

    res.json({ message: 'Login successful', ...result });
  } catch (err) {
    await createLog({
      user_id: null,
      action: 'LOGIN_FAILED',
      status_code: 400,
      message: err.message
    });

    res.status(400).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.logoutUser(token);

    // لو عندك user_id في req.user مثلاً من الميدل وير تبع الـ auth:
    await createLog({
      user_id: req.user?.user_id || null,
      action: 'LOGOUT',
      status_code: 200,
      message: 'User logged out'
    });

    res.json(result);
  } catch (err) {
    await createLog({
      user_id: req.user?.user_id || null,
      action: 'LOGOUT_FAILED',
      status_code: 500,
      message: err.message
    });

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
