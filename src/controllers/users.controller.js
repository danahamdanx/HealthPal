import { createCrudController } from './crud.controller.js';
import * as userService from '../services/users.service.js';
import { db } from "../config/db.js";


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

/** Get authenticated user info (auto role detection) */

export const getMe = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await userService.getUserByIdService(user_id); // use your service
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err.message);
    res.status(404).json({ error: err.message });
  }
};





