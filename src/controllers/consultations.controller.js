// src/controllers/consultations.controller.js
import { createCrudController } from './crud.controller.js';

const tableName = 'Consultations';
const primaryKey = 'consultation_id';
const allowedFields = [
  'patient_id',
  'doctor_id',
  'scheduled_time',
  'status',
  'consultation_type',
  'translation_needed',
  'notes',
  'diagnosis',
  'treatment'
];

export const {
  getAll: getAllConsultations,
  getById: getConsultationById,
  create: createConsultation,
  update: updateConsultation,
  delete: deleteConsultation,
} = createCrudController(tableName, primaryKey, allowedFields);
