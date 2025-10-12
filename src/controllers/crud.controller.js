import { db } from '../config/db.js';

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
        if (rows.length === 0) return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });
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
        allowedFields.forEach(f => {
          if (req.body[f] !== undefined) {
            fields.push(f);
            values.push(req.body[f]);
          }
        });

        if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });

        const placeholders = fields.map(() => '?').join(', ');
        const [result] = await db.query(
          `INSERT INTO ${tableName} (${fields.join(', ')}, created_at) VALUES (${placeholders}, NOW())`,
          values
        );

        const [newRow] = await db.query(`SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`, [result.insertId]);
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

        allowedFields.forEach(f => {
          if (req.body[f] !== undefined) {
            updates.push(`${f} = ?`);
            values.push(req.body[f]);
          }
        });

        if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

        values.push(req.params.id);
        const [result] = await db.query(
          `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${primaryKey} = ?`,
          values
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });

        const [updated] = await db.query(`SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
        res.json(updated[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error updating ${tableName.slice(0, -1)}` });
      }
    },

    delete: async (req, res) => {
      try {
        const [result] = await db.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: `${tableName.slice(0, -1)} not found` });
        res.json({ message: `${tableName.slice(0, -1)} deleted successfully` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Database error deleting ${tableName.slice(0, -1)}` });
      }
    },
  };
};
