import { db } from '../config/db.js';

// ✅ Create a new case
export const createCase = async (req, res) => {
  try {
    const { patient_id, title, description, target_amount, ngo_id } = req.body;

    if (!patient_id || !title || !target_amount)
      return res.status(400).json({ error: 'Missing required fields' });

    const [result] = await db.query(
      `INSERT INTO Cases (patient_id, ngo_id, title, description, target_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, ngo_id || null, title, description, target_amount]
    );

    const [newCase] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [result.insertId]);
    res.status(201).json(newCase[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating case' });
  }
};

// ✅ Verify case (only NGO assigned or admin)
export const verifyCase = async (req, res) => {
  try {
    const { case_id } = req.params;

    // Fetch case
    const [caseRows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
    if (caseRows.length === 0)
      return res.status(404).json({ error: 'Case not found' });

    const currentCase = caseRows[0];

    // ✅ Permission check
    if (req.user.role === 'ngo' && req.user.ngo_id !== currentCase.ngo_id)
      return res.status(403).json({ error: 'Not authorized to verify this case' });

    await db.query(
      `UPDATE Cases SET verified = 1, status = 'active' WHERE case_id = ?`,
      [case_id]
    );

    res.json({ message: 'Case verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error verifying case' });
  }
};

// ✅ Get all cases
export const getAllCases = async (req, res) => {
  try {
    let query = 'SELECT * FROM Cases';
    const params = [];

    // NGOs only see their own cases
    if (req.user.role === 'ngo' && req.user.ngo_id) {
      query += ' WHERE ngo_id = ?';
      params.push(req.user.ngo_id);
    }

    // Donors see only active/verified cases
    if (req.user.role === 'donor') {
      query += ' WHERE verified = 1 AND status IN ("active", "in_progress", "completed")';
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching cases' });
  }
};
