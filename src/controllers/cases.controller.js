import * as caseService from '../services/cases.service.js';

// ✅ إنشاء حالة جديدة
export const createCase = async (req, res) => {
  try {
    const newCase = await caseService.createCaseService(req.body);
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ التحقق من الحالة
export const verifyCase = async (req, res) => {
  try {
    const result = await caseService.verifyCaseService(req.params.case_id, req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ جلب جميع الحالات
export const getAllCases = async (req, res) => {
  try {
    const cases = await caseService.getAllCasesService(req.user);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// وظائف إضافية إذا كانت موجودة:
export const getCaseById = async (req, res) => {
  try {
    const c = await caseService.getCaseByIdService(req.params.case_id);
    res.json(c);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const updated = await caseService.updateCaseService(req.params.case_id, req.body, req.user);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const result = await caseService.deleteCaseService(req.params.case_id, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
