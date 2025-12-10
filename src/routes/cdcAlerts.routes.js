// src/routes/cdcAlerts.routes.js
import { Router } from 'express';
import {
  getLiveCdcAlerts,
  syncCdcAlerts,
} from '../controllers/cdcAlerts.controller.js';

const router = Router();

// يرجع Alerts مباشرة من CDC بدون تخزين
router.get('/cdc/live', getLiveCdcAlerts);

// يجلب من CDC + يخزن في PUBLICHEALTHALERTS
router.post('/cdc/sync', syncCdcAlerts);

export default router;