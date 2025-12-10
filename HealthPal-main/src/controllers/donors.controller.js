import { db } from '../config/db.js';
import { createCrudController } from './crud.controller.js';

export const donorsController = createCrudController(
  'Donors',
  'donor_id',
  ['name', 'email', 'phone', 'address', 'user_id', 'created_at']
);
