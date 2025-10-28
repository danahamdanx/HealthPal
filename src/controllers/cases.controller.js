// src/controllers/cases.controller.js
import { createCrudController } from './crud.controller.js';

export const casesController = createCrudController(
  'Cases',           // table name
  'case_id',         // primary key
  ['patient_id', 'title', 'medical_need', 'target_amount', 'raised_amount', 'status'] // allowed fields
);
