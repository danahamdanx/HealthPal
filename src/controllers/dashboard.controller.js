// src/controllers/dashboard.controller.js
import { getPatientDashboardData, getDoctorDashboardData } 
  from '../services/dashboard.service.js';

export const getPatientDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;        // من الـ JWT middleware
    const data = await getPatientDashboardData(userId);
    res.json(data);
  } catch (err) {
    console.error('Error patient dashboard:', err);
    res.status(500).json({ error: 'Error loading patient dashboard' });
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const data = await getDoctorDashboardData(userId);
    res.json(data);
  } catch (err) {
    console.error('Error doctor dashboard:', err);
    res.status(500).json({ error: 'Error loading doctor dashboard' });
  }
};