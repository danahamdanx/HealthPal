import * as medicalRequestService from '../services/medicalRequests.service.js';
import { db } from '../config/db.js';

export const createMedicalRequest = async (req, res) => {
  try {
    const result = await medicalRequestService.createMedicalRequestService(req.user, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllMedicalRequests = async (req, res) => {
  try {
    const result = await medicalRequestService.getAllMedicalRequestsService(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMedicalRequestById = async (req, res) => {
  try {
    const result = await medicalRequestService.getMedicalRequestByIdService(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const claimMedicalRequest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await medicalRequestService.claimMedicalRequestService(
      parseInt(req.params.id, 10),
      req.user,
      req.body,
      connection
    );
    await connection.commit();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    try { await connection.rollback(); } catch(e) {}
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

export const updateMedicalRequestStatus = async (req, res) => {
  try {
    const result = await medicalRequestService.updateMedicalRequestStatusService(req.params.id, req.user, req.body.status);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const cancelClaim = async (req, res) => {
  try {
    const result = await medicalRequestService.cancelClaimService(parseInt(req.params.id, 10), req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
