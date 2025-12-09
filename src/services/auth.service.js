import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from './token.service.js';
import { sendEmail } from '../utils/mailer.js';
import crypto from 'crypto';

// --- SIGNUP ---
export const signupUser = async ({ name, email, password, phone, role }) => {
  if (!name || !email || !password || !role) throw new Error('name, email, password, and role are required');

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Invalid email format');

  // Check existing user
  const [existing] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
  if (existing.length) throw new Error('Email already registered');

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO Users (name, email, password_hash, phone, role, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [name, email, password_hash, phone, role]
  );

  const userId = result.insertId;
  const [newUser] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);

  // Role mapping
  const roleMap = {
    patient: 'Patients',
    doctor: 'Doctors',
    ngo: 'NGOs',
    donor: 'Donors'
  };

  if (roleMap[role]) {
    const tableName = roleMap[role];
    const idField = `${role}_id`;
    await db.query(`INSERT INTO ${tableName} (user_id, name, email, phone) VALUES (?, ?, ?, ?)`,
      [userId, name, email, phone]);

    const [roleRecord] = await db.query(`SELECT ${idField} FROM ${tableName} WHERE user_id = ? LIMIT 1`, [userId]);

    const payload = {
      user_id: userId,
      role,
      [idField]: roleRecord?.[0]?.[idField] || null
    };

    const token = generateToken(payload);
    return { user: newUser[0], token };
  }

  // Role not mapped (e.g., admin)
  const token = generateToken({ user_id: userId, role });
  return { user: newUser[0], token };
};

// --- LOGIN ---
export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email and password are required');

  const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
  if (!rows.length) throw new Error('Invalid email or password');

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid email or password');

  // Attach role-specific ID
  let payload = { user_id: user.user_id, role: user.role };
  try {
    const [roleRows] = await db.query(`SELECT * FROM ${user.role}s WHERE email = ?`, [email]);
    if (roleRows.length) {
      const idCol = Object.keys(roleRows[0]).find(k => k.endsWith('_id'));
      if (idCol) payload[idCol] = roleRows[0][idCol];
    }
  } catch (_) {}

  const token = generateToken(payload);
  return { user, token };
};

// --- LOGOUT ---
export const logoutUser = async (token) => {
  // إذا كنت تستخدم blacklist token (Authorization header)
  await db.query(
    `INSERT INTO blacklisted_tokens (token, expires_at)
     VALUES (?, FROM_UNIXTIME(?))`,
    [token, jwt.decode(token).exp]
  );
  return { message: 'Logout successful' };
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (email) => {
  const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
  if (!users.length) return; // لا تظهر خطأ لمنع enumeration

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await db.query(
    `UPDATE Users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?`,
    [hashedToken, email]
  );

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    email,
    subject: 'Reset Your Password',
    message: `Use this link to reset your password: ${resetLink}`,
    html: `<a href="${resetLink}">${resetLink}</a>`
  });
};

// --- RESET PASSWORD ---
export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const [users] = await db.query(
    `SELECT * FROM Users WHERE reset_token = ? AND reset_token_expires > NOW()`,
    [hashedToken]
  );

  if (!users.length) throw new Error('Invalid or expired token');

  const password_hash = await bcrypt.hash(newPassword, 10);

  await db.query(
    `UPDATE Users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?`,
    [password_hash, users[0].user_id]
  );
};
