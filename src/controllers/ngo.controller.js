import { createCrudController } from './crud.controller.js';

export const {
  getAll: getAllNgos,
  getById: getNgoById,
  create: createNgo,
  update: updateNgo,
  delete: deleteNgo
} = createCrudController('Ngos', 'ngo_id', ['name', 'registration_number', 'address', 'verified','phone','email','mission']);
