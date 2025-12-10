// src/controllers/ngoReports.controller.js
import {
  getNgoSummary,
  getNgoDonationsByMonth,
  getNgoTopCases,
} from '../services/ngoReports.service.js';

// GET /api/ngos/:ngoId/reports/summary
export const getNgoSummaryReport = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const data = await getNgoSummary(ngoId);
    res.json(data);
  } catch (err) {
    console.error('Error in getNgoSummaryReport:', err);
    res.status(500).json({ error: err.message || 'Error loading NGO summary' });
  }
};

// GET /api/ngos/:ngoId/reports/donations-by-month
export const getNgoDonationsByMonthReport = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const data = await getNgoDonationsByMonth(ngoId);
    res.json({ ngoId, donationsByMonth: data });
  } catch (err) {
    console.error('Error in getNgoDonationsByMonthReport:', err);
    res
      .status(500)
      .json({ error: err.message || 'Error loading donations by month' });
  }
};

// GET /api/ngos/:ngoId/reports/top-cases?limit=5
export const getNgoTopCasesReport = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const limit = parseInt(req.query.limit || '5', 10);
    const data = await getNgoTopCases(ngoId, limit);
    res.json({ ngoId, topCases: data });
  } catch (err) {
    console.error('Error in getNgoTopCasesReport:', err);
    res.status(500).json({ error: err.message || 'Error loading top cases' });
  }
};