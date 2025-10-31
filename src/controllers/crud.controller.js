import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * Create a generic CRUD controller for any table.
 * @param {string} tableName - Table name in DB.
 * @param {string} primaryKey - Primary key column (e.g., 'user_id', 'patient_id').
 * @param {string[]} allowedFields - Fields that can be created/updated.
 */
export const createCrudController = (tableName, primaryKey, allowedFields) => {
  return {
    getAll: async (req, res) => {
      try {
        const [rows] = await db.query(`SELECT * FROM ${tableName} ORDER BY ${primaryKey} DESC`);
        res.json(rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error fetching ${tableName}` });
      }
    },

    getById: async (req, res) => {
      try {
        const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
        if (rows.length === 0)
          return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });
        res.json(rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error fetching ${tableName.slice(0, -1)}` });
      }
    },

    create: async (req, res) => {
      try {
        const fields = [];
        const values = [];

        // ✅ Automatically hash password if "password_hash" is allowed and a plain "password" is sent
       if (allowedFields.includes('password_hash') && req.body.password) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(req.body.password, salt);
  // Replace/add password_hash field
  if (!fields.includes('password_hash')) {
    fields.push('password_hash');
    values.push(hashed);
  } else {
    values[fields.indexOf('password_hash')] = hashed;
  }
  delete req.body.password; // remove plaintext password
}

        // ✅ Collect allowed fields
        allowedFields.forEach(f => {
          if (req.body.hasOwnProperty(f)) {
            fields.push(f);
            values.push(req.body[f]);
          }
        });

        if (!fields.length)
          return res.status(400).json({ error: 'No valid fields provided' });

        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;

        const [result] = await db.query(sql, values);

        const [newRow] = await db.query(
          `SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`,
          [result.insertId]
        );

        // Optional: hide password_hash from response
        if (newRow[0].password_hash) delete newRow[0].password_hash;

        res.status(201).json(newRow[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error creating ${tableName.slice(0, -1)}` });
      }
    },

    update: async (req, res) => {
      try {
        const updates = [];
        const values = [];

        // ✅ Handle password updates too
        if (allowedFields.includes('password_hash') && req.body.password) {
          const salt = await bcrypt.genSalt(10);
          req.body.password_hash = await bcrypt.hash(req.body.password, salt);
          delete req.body.password;
        }

        allowedFields.forEach(f => {
          if (req.body[f] !== undefined) {
            updates.push(`${f} = ?`);
            values.push(req.body[f]);
          }
        });

        if (!updates.length)
          return res.status(400).json({ error: 'No valid fields to update' });

        values.push(req.params.id);
        const [result] = await db.query(
          `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${primaryKey} = ?`,
          values
        );

        if (result.affectedRows === 0)
          return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });

        const [updated] = await db.query(
          `SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`,
          [req.params.id]
        );

        if (updated[0].password_hash) delete updated[0].password_hash;

        res.json(updated[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error updating ${tableName.slice(0, -1)}` });
      }
    },

 delete: async (req, res) => {
  try {
    // First, fetch the row to get the linked user_id
    const [rows] = await db.query(`SELECT user_id FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
    if (rows.length === 0) 
      return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });

    const userId = rows[0].user_id;

    // Delete the role row
    await db.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);

    // Optionally, delete the user
    if (userId) {
      await db.query(`DELETE FROM Users WHERE user_id = ?`, [userId]);
    }

    res.json({ message: `${tableName.slice(0, -1)} and linked user deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Database error deleting ${tableName.slice(0, -1)}` });
  }
},

  };
};
