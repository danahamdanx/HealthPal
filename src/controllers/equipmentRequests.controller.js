import * as equipmentRequestService from '../services/equipmentRequest.service.js';

export const createEquipmentRequest = async (req, res) => {
  try {
    const request = await equipmentRequestService.createEquipmentRequestService(req.user, req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const claimEquipmentRequest = async (req, res) => {
  try {
    const result = await equipmentRequestService.claimEquipmentRequestService(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEquipmentRequestStatus = async (req, res) => {
  try {
    const result = await equipmentRequestService.updateEquipmentRequestStatusService(req.params.id, req.body.status, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const deleteEquipmentRequest = async (req, res) => {
  try {
    const result = await equipmentRequestService.deleteEquipmentRequestService(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};
export const getMyEquipmentRequests = async (req, res) => {
  try {
    const requests = await equipmentRequestService.getMyEquipmentRequestsService(req.user);
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const listEquipmentRequests = async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending مثلاً
    const result = await equipmentRequestService.listEquipmentRequestsService(req.user, { status });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};