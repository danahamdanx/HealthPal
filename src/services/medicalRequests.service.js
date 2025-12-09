import { db } from '../config/db.js';

export const createMedicalRequestService = async (user, data) => {
  const { item_name, quantity = 1, urgency = 'medium', notes } = data;
  const patient_id = user?.patient_id || data.patient_id || user?.user_id;

  if (!patient_id) throw new Error('patient_id missing');
  if (!item_name) throw new Error('item_name is required');
  if (!['low','medium','critical'].includes(urgency)) throw new Error('Invalid urgency');

  const [result] = await db.query(
    `INSERT INTO MedicalRequests (patient_id, item_name, quantity, urgency, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_id, item_name, quantity, urgency, notes]
  );

  const [rows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [result.insertId]);
  return rows[0];
};

export const getAllMedicalRequestsService = async (user) => {
  let sql = 'SELECT * FROM MedicalRequests';
  const params = [];

  if (user?.role === 'patient') {
    const patient_id = user?.patient_id || user?.user_id;
    sql += ' WHERE patient_id = ?';
    params.push(patient_id);
  } else if (user?.role === 'donor') {
    sql += (params.length ? ' AND ' : ' WHERE ') + "status != 'canceled'";
  }

  sql += ' ORDER BY created_at DESC';
  const [rows] = await db.query(sql, params);
  return rows;
};

export const getMedicalRequestByIdService = async (id, user) => {
  const [rows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [id]);
  if (!rows.length) throw new Error('Request not found');

  const request = rows[0];
  if (user?.role === 'patient') {
    const patient_id = user?.patient_id || user?.user_id;
    if (request.patient_id !== patient_id) throw new Error('Not authorized');
  }

  return request;
};

// Claim a medical request
export const claimMedicalRequestService = async (requestId, user, body, connection) => {
  let ngo_id = null, donor_id = null;

  if (user?.role === 'ngo') ngo_id = user.ngo_id || body.ngo_id || null;
  if (user?.role === 'donor') donor_id = user.donor_id || body.donor_id || null;
  if (user?.role === 'admin') {
    ngo_id = body.ngo_id || null;
    donor_id = body.donor_id || null;
  }

  if (!ngo_id && !donor_id) throw new Error('Claim must include ngo_id or donor_id');

  // check request exists and status
  const [reqRows] = await connection.query('SELECT status FROM MedicalRequests WHERE request_id = ? FOR UPDATE', [requestId]);
  if (!reqRows.length) throw new Error('Request not found');
  if (reqRows[0].status !== 'pending') throw new Error(`Cannot claim request with status '${reqRows[0].status}'`);

  const [ins] = await connection.query(
    `INSERT INTO RequestClaims (request_id, ngo_id, donor_id, status) VALUES (?, ?, ?, 'claimed')`,
    [requestId, ngo_id, donor_id]
  );

  await connection.query('UPDATE MedicalRequests SET status = ? WHERE request_id = ?', ['claimed', requestId]);

  const [createdClaimRows] = await db.query('SELECT * FROM RequestClaims WHERE claim_id = ?', [ins.insertId]);
  const [updatedReqRows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [requestId]);

  return { claim: createdClaimRows[0], request: updatedReqRows[0] };
};

export const updateMedicalRequestStatusService = async (requestId, user, status) => {
  const validStatuses = ["pending", "claimed", "in_transit", "delivered"];
  if (!validStatuses.includes(status)) throw new Error("Invalid status");

  const [rows] = await db.query(
    `SELECT MR.patient_id, MR.status, RC.ngo_id, RC.donor_id
     FROM MedicalRequests MR
     LEFT JOIN RequestClaims RC ON MR.request_id = RC.request_id
     WHERE MR.request_id = ?`,
    [requestId]
  );
  if (!rows.length) throw new Error("Medical request not found");

  const request = rows[0];

  // Permission checks
  if (status === "delivered") {
    const isClaimedNGO = user.role === "ngo" && user.ngo_id === request.ngo_id;
    const isClaimedDonor = user.role === "donor" && user.donor_id === request.donor_id;
    const isAdmin = user.role === "admin";
    if (!isClaimedNGO && !isClaimedDonor && !isAdmin) throw new Error("Not authorized to mark delivered");
  }
  if (["claimed","in_transit"].includes(status) && !["ngo","donor","admin"].includes(user.role)) {
    throw new Error("Only NGOs or donors can update request progress");
  }

  await db.query('UPDATE MedicalRequests SET status = ? WHERE request_id = ?', [status, requestId]);
  await db.query('UPDATE RequestClaims SET status = ? WHERE request_id = ?', [status, requestId]);

  return { request_id: requestId, status };
};

export const cancelClaimService = async (requestId, user) => {
  const [claimRows] = await db.query('SELECT * FROM RequestClaims WHERE request_id = ? ORDER BY claimed_at DESC LIMIT 1', [requestId]);
  if (!claimRows.length) throw new Error('No claim found');

  const claim = claimRows[0];
  const isAdmin = user?.role === 'admin';
  let isClaimant = false;
  if (claim.ngo_id && user?.role === 'ngo' && user.ngo_id === claim.ngo_id) isClaimant = true;
  if (claim.donor_id && user?.role === 'donor' && user.donor_id === claim.donor_id) isClaimant = true;
  if (!isAdmin && !isClaimant) throw new Error('Not authorized to cancel claim');

  await db.query('UPDATE RequestClaims SET status = ? WHERE claim_id = ?', ['canceled', claim.claim_id]);
  await db.query('UPDATE MedicalRequests SET status = ? WHERE request_id = ?', ['pending', requestId]);

  const [updatedReq] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [requestId]);
  return updatedReq[0];
};
export const deleteMedicalRequestService = async (requestId, user) => {
  // Fetch the request first
  const [rows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [requestId]);
  if (!rows.length) throw new Error('Medical request not found');

  const request = rows[0];

  // Authorization: only the patient who created it or admin
  const patient_id = request.patient_id;
  if (user.role !== 'admin' && user.user_id !== patient_id) {
    throw new Error('Not authorized to delete this request');
  }

  // Delete associated claims first (optional, depends on your schema)
  await db.query('DELETE FROM RequestClaims WHERE request_id = ?', [requestId]);

  // Delete the medical request
  await db.query('DELETE FROM MedicalRequests WHERE request_id = ?', [requestId]);

  return { message: 'Medical request deleted successfully', request_id: requestId };
};
