// src/controllers/cdcAlerts.controller.js
import {
  fetchCdcAlertsFromApi,
  syncCdcAlertsToDb,
} from '../services/cdcAlerts.service.js';

// GET /api/public-health-alerts/cdc/live?topic=Emergencies&max=10
export const getLiveCdcAlerts = async (req, res) => {
  try {
    const topic = req.query.topic || 'Emergencies';
    const max = parseInt(req.query.max || '20', 10);

    const alerts = await fetchCdcAlertsFromApi({ topic, max });

    res.json({
      source: 'CDC',
      topic,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    console.error('Error getLiveCdcAlerts:', err?.response?.data || err);
    res.status(500).json({ error: 'Failed to fetch CDC alerts' });
  }
};

// POST /api/public-health-alerts/cdc/sync?topic=Emergencies&max=20
export const syncCdcAlerts = async (req, res) => {
  try {
    const topic = req.query.topic || 'Emergencies';
    const max = parseInt(req.query.max || '20', 10);

    const result = await syncCdcAlertsToDb({ topic, max });

    res.json({
      message: 'CDC alerts synced successfully',
      topic,
      ...result,
    });
  } catch (err) {
    console.error('Error syncCdcAlerts:', err?.response?.data || err);
    res.status(500).json({ error: 'Failed to sync CDC alerts' });
  }
};