// src/controllers/sponsorships.controller.js
import { createCrudController } from './crud.controller.js';

export const sponsorshipsController = createCrudController(
  'Sponsorships',      // table name
  'sponsorship_id',    // primary key
  ['ngo_id', 'case_id', 'contribution_amount', 'status'] // allowed fields
);
