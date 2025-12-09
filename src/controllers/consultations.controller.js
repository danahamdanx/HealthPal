import * as consultationService from '../services/consultation.service.js';

export const getAllConsultations = async (req, res) => {
  try {
    const consultations = await consultationService.getAllConsultations(req.user);
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConsultationById = async (req, res) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id, req.user);
    res.json(consultation);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const consultation = await consultationService.createConsultation(req.body);
    res.status(201).json(consultation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const updated = await consultationService.updateConsultation(req.params.id, req.user, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateConsultationStatus = async (req, res) => {
  try {
    const updated = await consultationService.updateConsultationStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteConsultation = async (req, res) => {
  try {
    const result = await consultationService.deleteConsultation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
