import { db } from '../config/db.js';

// ✅ إنشاء حالة جديدة
export const createCaseService = async (data) => {
  const { patient_id, title, description, target_amount, ngo_id } = data;
  if (!patient_id || !title || !target_amount) throw new Error('Missing required fields');

  const [result] = await db.query(
    `INSERT INTO Cases (patient_id, ngo_id, title, description, target_amount)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_id, ngo_id || null, title, description, target_amount]
  );

  const [newCase] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [result.insertId]);
  return newCase[0];
};

// ✅ التحقق من الحالة (NGO assigned أو admin)
export const verifyCaseService = async (case_id, user) => {
  const [caseRows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
  if (!caseRows.length) throw new Error('Case not found');

  const currentCase = caseRows[0];
  if (user.role === 'ngo' && user.ngo_id !== currentCase.ngo_id)
    throw new Error('Not authorized to verify this case');

  await db.query(`UPDATE Cases SET verified = 1, status = 'active' WHERE case_id = ?`, [case_id]);
  return { message: 'Case verified successfully' };
};

// ✅ جلب جميع الحالات
export const getAllCasesService = async (user) => {
  let query = 'SELECT * FROM Cases';
  const params = [];

  if (user.role === 'ngo' && user.ngo_id) {
    query += ' WHERE ngo_id = ?';
    params.push(user.ngo_id);
  } else if (user.role === 'donor') {
    query += ' WHERE verified = 1 AND status IN ("active", "in_progress", "completed")';
  }

  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query, params);
  return rows;
};

// وظائف إضافية إذا كانت موجودة:
export const getCaseByIdService = async (case_id) => {
  const [rows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
  if (!rows.length) throw new Error('Case not found');
  return rows[0];
};

export const updateCaseService = async (case_id, data, user) => {
  const [rows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
  if (!rows.length) throw new Error('Case not found');

  const currentCase = rows[0];
  if (user.role === 'ngo' && user.ngo_id !== currentCase.ngo_id)
    throw new Error('Not authorized to update this case');

  const updates = [];
  const values = [];
  Object.keys(data).forEach(key => {
    updates.push(`${key} = ?`);
    values.push(data[key]);
  });

  if (!updates.length) throw new Error('No valid fields to update');
  values.push(case_id);

  await db.query(`UPDATE Cases SET ${updates.join(', ')} WHERE case_id = ?`, values);

  const [updatedRows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
  return updatedRows[0];
};

export const deleteCaseService = async (case_id, user) => {
  const [rows] = await db.query('SELECT * FROM Cases WHERE case_id = ?', [case_id]);
  if (!rows.length) throw new Error('Case not found');

  const currentCase = rows[0];
  if (user.role === 'ngo' && user.ngo_id !== currentCase.ngo_id)
    throw new Error('Not authorized to delete this case');

  await db.query('DELETE FROM Cases WHERE case_id = ?', [case_id]);
  return { message: 'Case deleted successfully' };
};
