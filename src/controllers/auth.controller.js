import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// --- SIGNUP ---
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }
    // Email format validation
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email format. Please use a valid email address.' });
   }


    const [existing] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO Users (name, email, password_hash, phone, role, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, email, password_hash, phone, role]
    );

    const [newUser] = await db.query('SELECT * FROM Users WHERE user_id = ?', [result.insertId]);

    // Dynamically check if a table exists for the role
    let payload = { user_id: newUser[0].user_id, role: newUser[0].role };
    try {
      const [roleRows] = await db.query(`SELECT * FROM ${role}s WHERE email = ?`, [email]);
      if (roleRows.length) {
        const idCol = Object.keys(roleRows[0]).find(k => k.endsWith('_id'));
        if (idCol) payload[idCol] = roleRows[0][idCol];
      }
    } catch (_) {
      // No role table found; ignore
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Signup successful', user: newUser[0], token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    // Dynamically attach role-specific ID if exists
    let payload = { user_id: user.user_id, role: user.role };
    try {
      const [roleRows] = await db.query(`SELECT * FROM ${user.role}s WHERE email = ?`, [email]);
      if (roleRows.length) {
        const idCol = Object.keys(roleRows[0]).find(k => k.endsWith('_id'));
        if (idCol) payload[idCol] = roleRows[0][idCol];
      }
    } catch (_) {
      // No role table found; ignore
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
