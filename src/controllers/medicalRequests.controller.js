// src/controllers/medicalRequests.controller.js
import { db } from '../config/db.js';

/**
 * Medical Requests controller
 * Roles:
 *  - patient: create request, view own requests
 *  - ngo: view/claim/update requests
 *  - donor: view/claim/update requests (goods-based)
 *  - admin: full access
 */

// Helper: allowed status transitions (you can adjust as needed)
const ALLOWED_STATUSES = ['pending','claimed','in_transit','delivered','canceled'];

/** Create a medical request (patient) */
export const createMedicalRequest = async (req, res) => {
  try {
    const { item_name, quantity = 1, urgency = 'medium', notes } = req.body;

    // patient_id: prefer req.user.patient_id, fallback to provided patient_id
    const patient_id = req.user?.patient_id || req.body.patient_id || req.user?.user_id;
    if (!patient_id) return res.status(400).json({ error: 'patient_id missing' });

    if (!item_name) return res.status(400).json({ error: 'item_name is required' });
    if (!['low','medium','critical'].includes(urgency))
      return res.status(400).json({ error: 'Invalid urgency' });

    const [result] = await db.query(
      `INSERT INTO MedicalRequests (patient_id, item_name, quantity, urgency, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, item_name, quantity, urgency, notes]
    );

    const [rows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error creating medical request' });
  }
};

/** Get all medical requests (marketplace) */
export const getAllMedicalRequests = async (req, res) => {
  try {
    let sql = 'SELECT * FROM MedicalRequests';
    const params = [];

    // Patients see their own requests
    if (req.user?.role === 'patient') {
      const patient_id = req.user?.patient_id || req.user?.user_id;
      sql += ' WHERE patient_id = ?';
      params.push(patient_id);
    } else if (req.user?.role === 'ngo') {
      // NGOs see all requests 
      // optional: show pending and claimed so NGOs can pick
    } else if (req.user?.role === 'donor') {
      // donors see only verified requests? This is outside scope; we'll show all non-canceled
      sql += (params.length ? ' AND ' : ' WHERE ') + "status != 'canceled'";
    } else {
      // admin: full access
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching medical requests' });
  }
};

/** Get single request by id */
export const getMedicalRequestById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });

    const request = rows[0];

    // Access control: patient only their own
    if (req.user?.role === 'patient') {
      const patient_id = req.user?.patient_id || req.user?.user_id;
      if (request.patient_id !== patient_id) return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching request' });
  }
};

/** Claim a request (ngo or donor) */
export const claimMedicalRequest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const requestId = parseInt(req.params.id, 10);
    if (!requestId) return res.status(400).json({ error: 'Invalid request id' });

    // who is claiming? prefer authenticated id
    let ngo_id = null;
    let donor_id = null;
    if (req.user?.role === 'ngo') ngo_id = req.user.ngo_id || req.body.ngo_id || null;
    if (req.user?.role === 'donor') donor_id = req.user.donor_id || req.body.donor_id || null;
    // admin can claim as either by body
    if (req.user?.role === 'admin') {
      ngo_id = req.body.ngo_id || null;
      donor_id = req.body.donor_id || null;
    }

    // require at least one ID
    if (!ngo_id && !donor_id) return res.status(400).json({ error: 'Claim must include ngo_id or donor_id (or authenticate as NGO/Donor)' });

    await connection.beginTransaction();

    // 1) check request exists and is pending
    const [reqRows] = await connection.query('SELECT status FROM MedicalRequests WHERE request_id = ? FOR UPDATE', [requestId]);
    if (!reqRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Request not found' });
    }
    const reqRow = reqRows[0];
    if (reqRow.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `Cannot claim request with status '${reqRow.status}'` });
    }

    // 2) insert RequestClaims
    const [ins] = await connection.query(
      `INSERT INTO RequestClaims (request_id, ngo_id, donor_id, status) VALUES (?, ?, ?, 'claimed')`,
      [requestId, ngo_id, donor_id]
    );

    // 3) update MedicalRequests.status -> 'claimed'
    await connection.query('UPDATE MedicalRequests SET status = ? WHERE request_id = ?', ['claimed', requestId]);

    await connection.commit();

    // return claim + updated request
    const [createdClaimRows] = await db.query('SELECT * FROM RequestClaims WHERE claim_id = ?', [ins.insertId]);
    const [updatedReqRows] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [requestId]);

    res.status(201).json({ claim: createdClaimRows[0], request: updatedReqRows[0] });
  } catch (err) {
    console.error(err);
    try { await connection.rollback(); } catch (e) {}
    res.status(500).json({ error: 'Database error claiming request' });
  } finally {
    connection.release();
  }
};

/** Update status of a request (only claimant or admin) */
/** Update status of a request (only claimant or admin) */
export const updateMedicalRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["pending", "claimed", "in_transit", "delivered"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    // Pull request + claim info
    const [rows] = await db.query(
      `SELECT MR.patient_id, MR.status, RC.ngo_id, RC.donor_id
       FROM MedicalRequests MR
       LEFT JOIN RequestClaims RC ON MR.request_id = RC.request_id
       WHERE MR.request_id = ?`,
      [requestId]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Medical request not found" });

    const request = rows[0];

    /** 🚫 PATIENT IS NOT ALLOWED TO MARK DELIVERED **/
    if (status === "delivered") {
      const isClaimedNGO = req.user.role === "ngo" && req.user.ngo_id === request.ngo_id;
      const isClaimedDonor = req.user.role === "donor" && req.user.donor_id === request.donor_id;
      const isAdmin = req.user.role === "admin";

      if (!isClaimedNGO && !isClaimedDonor && !isAdmin) {
        return res.status(403).json({
          error: "Only the claimant (NGO/Donor) or Admin can mark as delivered"
        });
      }
    }

    /** ✅ NGO / Donor can update status to claimed / in_transit */
    if (["claimed", "in_transit"].includes(status)) {
      if (!["ngo", "donor", "admin"].includes(req.user.role)) {
        return res.status(403).json({ error: "Only NGOs or donors can update request progress" });
      }
    }

    // ✅ Update MedicalRequests
    await db.query(
      `UPDATE MedicalRequests SET status = ? WHERE request_id = ?`,
      [status, requestId]
    );

    // ✅ Sync status in RequestClaims
    await db.query(
      `UPDATE RequestClaims SET status = ? WHERE request_id = ?`,
      [status, requestId]
    );

    res.json({
      request_id: requestId,
      status,
      message: "Status updated and synchronized with claim record."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating request status" });
  }
};


/** Optional: cancel claim (claimant or admin) */
export const cancelClaim = async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (!requestId) return res.status(400).json({ error: 'Invalid request id' });

    const [claimRows] = await db.query('SELECT * FROM RequestClaims WHERE request_id = ? ORDER BY claimed_at DESC LIMIT 1', [requestId]);
    if (!claimRows.length) return res.status(404).json({ error: 'No claim found' });
    const claim = claimRows[0];

    // auth: claimant or admin
    const isAdmin = req.user?.role === 'admin';
    let isClaimant = false;
    if (claim.ngo_id && req.user?.role === 'ngo' && req.user.ngo_id === claim.ngo_id) isClaimant = true;
    if (claim.donor_id && req.user?.role === 'donor' && req.user.donor_id === claim.donor_id) isClaimant = true;
    if (!isAdmin && !isClaimant) return res.status(403).json({ error: 'Not authorized to cancel claim' });

    // mark claim canceled and set request back to pending
    await db.query('UPDATE RequestClaims SET status = ? WHERE claim_id = ?', ['canceled', claim.claim_id]);
    await db.query('UPDATE MedicalRequests SET status = ? WHERE request_id = ?', ['pending', requestId]);

    const [updatedReq] = await db.query('SELECT * FROM MedicalRequests WHERE request_id = ?', [requestId]);
    res.json(updatedReq[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error canceling claim' });
  }
};
