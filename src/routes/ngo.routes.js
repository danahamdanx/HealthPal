import express from 'express';
import * as ctrl from '../controllers/ngo.controller.js';

const router = express.Router();

// ✅ GET all Ngos
router.get('/', ctrl.getAllNgos);

// ✅ GET single Ngo
router.get('/:id', ctrl.getNgoById);

// ✅ POST new Ngo
router.post('/', ctrl.createNgo);

// ✅ PUT update Ngo
router.put('/:id', ctrl.updateNgo);

// ✅ DELETE Ngo
router.delete('/:id', ctrl.deleteNgo);

// ✅ Export router
export default router;
