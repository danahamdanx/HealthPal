import { db } from '../config/db.js';

const TABLE_NAME = 'Users';

export const searchUsers = async ({ email, phone }) => {
  let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
  const params = [];

  if (email) {
    query += ` AND email = ?`;
    params.push(email);
  }

  if (phone) {
    query += ` AND phone = ?`;
    params.push(phone);
  }

  const [rows] = await db.query(query, params); // mysql2 returns [rows, fields]
  return rows;
};


/** Get user by user_id */
/** Get a single user by user_id */
export const getUserByIdService = async (user_id) => {
  if (!user_id) throw new Error('User ID is required');

  const [rows] = await db.query(
    `SELECT user_id, name, email, phone, role 
     FROM Users 
     WHERE user_id = ?`,
    [user_id]
  );

  if (!rows.length) {
    console.error(`getUserByIdService: No user found with ID ${user_id}`);
    throw new Error('User not found');
  }

  return rows[0];
};
