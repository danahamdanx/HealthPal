import { db } from '../config/db.js';

export const getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM Users');
  return rows;
};
