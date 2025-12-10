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
