import {
  getPatientDashboardData,
  getDoctorDashboardData,
  getNgoDashboardData,
  getDonorDashboardData,
} from "../services/dashboard.service.js";

export const getPatientDashboard = async (req, res) => {
  try {
    const data = await getPatientDashboardData(req.user.user_id);
    res.json(data);
  } catch (err) {
    console.error("Patient Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load patient dashboard" });
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    const data = await getDoctorDashboardData(req.user.user_id);
    res.json(data);
  } catch (err) {
    console.error("Doctor Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load doctor dashboard" });
  }
};

export const getNgoDashboard = async (req, res) => {
  try {
    const data = await getNgoDashboardData(req.user.user_id);
    res.json(data);
  } catch (err) {
    console.error("NGO Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load NGO dashboard" });
  }
};

export const getDonorDashboard = async (req, res) => {
  try {
    const data = await getDonorDashboardData(req.user.user_id);
    res.json(data);
  } catch (err) {
    console.error("Donor Dashboard Error:", err);
    res.status(500).json({ error: "Failed to load donor dashboard" });
  }
};
