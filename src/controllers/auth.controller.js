// src/controllers/auth.controller.js
import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// --- SIGNUP ---
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format. Please use a valid email address.' });
    }

    // ✅ Check if email already exists
    const [existing] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    // ✅ Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ Insert into Users table
    const [result] = await db.query(
      `INSERT INTO Users (name, email, password_hash, phone, role, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, email, password_hash, phone, role]
    );

    const userId = result.insertId;
    const [newUser] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);

    // ✅ Automatically create corresponding role record
    const roleMap = {
      patient: 'Patients',
      doctor: 'Doctors',
      ngo: 'NGOs',
      donor: 'Donors'
    };

   if (roleMap[role]) {
  const tableName = roleMap[role];
  const idField = `${role}_id`;

  await db.query(
    `INSERT INTO ${tableName} (user_id, name, email, phone) VALUES (?, ?, ?, ?)`,
    [userId, name, email, phone]
  );

  const [roleRecord] = await db.query(
    `SELECT ${idField} FROM ${tableName} WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  const payload = {
    user_id: userId,
    role: role,
    [idField]: roleRecord?.[0]?.[idField] || null
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: `Signup successful as ${role}`,
    user: newUser[0],
    token
  });
}


    // If role not mapped (like admin), still issue token
    const token = jwt.sign({ user_id: userId, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: `Signup successful as ${role}`,
      user: newUser[0],
      token
    });

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

// --- LOGOUT ---
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);

    await db.query(
      `INSERT INTO blacklisted_tokens (token, expires_at)
       VALUES (?, FROM_UNIXTIME(?))`,
      [token, decoded.exp]
    );

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

    // Prevent email enumeration
    if (!users.length) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await db.query(
      `UPDATE Users 
       SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
       WHERE user_id = ?`,
      [hashedToken, users[0].user_id]
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      email: users[0].email,
      subject: 'Reset Your Password',
      message: `
You requested a password reset.

Use the link below to reset your password:
${resetLink}

This link will expire in 15 minutes.
If you did not request this, ignore this email.
      `,
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetLink}" style="color:#2563eb;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p>This link expires in <b>15 minutes</b>.</p>
        <p>If you didn’t request this, simply ignore this email.</p>
      `
    });

    res.json({ message: 'If the email exists, a reset link has been sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during forgot password' });
  }
};


