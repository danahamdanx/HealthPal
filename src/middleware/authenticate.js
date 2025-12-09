import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Access denied. No token provided.' });

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted
    const [rows] = await db.query('SELECT id FROM blacklisted_tokens WHERE token = ?', [token]);
    if (rows.length) return res.status(401).json({ error: 'Token has been revoked' });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

    if (!decoded.user_id) return res.status(401).json({ error: 'Invalid token payload' });

    req.user = decoded; // now has { user_id, role }
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
