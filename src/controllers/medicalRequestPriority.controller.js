// src/controllers/medicalRequestPriority.controller.js
import { fetchPrioritizedMedicalRequests } from '../services/medicalRequestPriority.service.js';

export const getPrioritizedMedicalRequests = async (req, res) => {
  try {
    const status = req.query.status || null;          // مثال: ?status=pending
    const limit  = parseInt(req.query.limit || '50', 10); // مثال: ?limit=20

    const requests = await fetchPrioritizedMedicalRequests({ status, limit });

    res.json({
      count: requests.length,
      requests,
    });
  } catch (err) {
    console.error('Error getPrioritizedMedicalRequests:', err);
    res.status(500).json({ error: 'Error loading prioritized medical requests' });
  }
};