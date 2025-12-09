import { createCrudController } from './crud.controller.js';
import { searchUsers } from '../services/users.service.js';

export const {
  getAll: getAllUsers,
  getById: getUserById,
  create: createUser,
  update: updateUser,
  delete: deleteUser
} = createCrudController('Users', 'user_id', ['name', 'email', 'password_hash', 'phone', 'role']);

// Search endpoint

export const searchUserByEmailOrPhone = async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Please provide email or phone to search' });
  }

  const users = await searchUsers({ email, phone });
  res.json(users);
};



