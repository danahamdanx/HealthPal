import { createCrudController } from './crud.controller.js';

export const {
  getAll: getAllPatients,
  getById: getPatientById,
  create: createPatient,
  update: updatePatient,
  delete: deletePatient
} = createCrudController('Patients', 'patient_id', ['name', 'dob', 'gender', 'bloodtype', 'address','medicalhistory']);
