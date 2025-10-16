import { createCrudController } from './crud.controller.js';

export const {
  getAll: getAllDoctors,
  getById: getDoctorById,
  create: createDoctor,
  update: updateDoctor,
  delete: deleteDoctor
} = createCrudController('Patients', 'patient_id', ['name', 'phone', 'email', 'gender', 'qualification','hospital_name','address','specialty','experience_year','availability']);
