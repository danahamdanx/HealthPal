import { createCrudController } from './crud.controller.js';

export const {
  getAll: getAllUsers,
  getById: getUserById,
  create: createUser,
  update: updateUser,
  delete: deleteUser
} = createCrudController('Users', 'user_id', ['name', 'email', 'password_hash', 'phone', 'role']);
