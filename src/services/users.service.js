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
