import { createCrudController } from './crud.controller.js';

export const {
  getAll: getAllPatients,
  getById: getPatientById,
  create: createPatient,
  update: updatePatient,
  delete: deletePatient
} = createCrudController('Patients', 'patient_id', ['name', 'date_of_birth', 'gender', 'blood_type', 'address','phone','medical_history']);
