// src/controllers/equipmentRequests.controller.js
import { db } from "../config/db.js";

export const createEquipmentRequest = async (req, res) => {
  try {
    const { equipment_id, reason, duration_days } = req.body;

    const patient_id = req.user.patient_id;
    if (!patient_id) return res.status(400).json({ error: "Patient only" });

    if (!equipment_id) return res.status(400).json({ error: "equipment_id required" });

    const [eq] = await db.query(`SELECT availability_status FROM EquipmentInventory WHERE equipment_id = ?`,
      [equipment_id]);

    if (!eq.length) return res.status(404).json({ error: "Equipment not found" });

    if (eq[0].availability_status !== "available")
      return res.status(400).json({ error: "Equipment unavailable" });

    const [result] = await db.query(
      `INSERT INTO EquipmentRequests (equipment_id, patient_id, reason, duration_days)
       VALUES (?, ?, ?, ?)`,
      [equipment_id, patient_id, reason, duration_days]
    );

    const [rows] = await db.query(
      `SELECT * FROM EquipmentRequests WHERE request_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating equipment request" });
  }
};


/** Claim request (NGO / Donor / Admin) */
export const claimEquipmentRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const [rows] = await db.query(
      `SELECT * FROM EquipmentRequests WHERE request_id = ?`,
      [requestId]
    );

    if (!rows.length) return res.status(404).json({ error: "Request not found" });
    const request = rows[0];

    if (request.status !== "pending")
      return res.status(400).json({ error: "Already claimed" });

    const claimant_type = req.user.role;
    const claimant_user_id = req.user.user_id;

    await db.query(
      `UPDATE EquipmentRequests 
       SET status='claimed', claimed_by_user_id=?, claimed_by_type=? 
       WHERE request_id=?`,
      [claimant_user_id, claimant_type, requestId]
    );

    res.json({ message: "Request claimed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error claiming request" });
  }
};


/** Update request status */
export const updateEquipmentRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    const allowed = ["pending", "claimed", "in_transit", "delivered"];

    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const [rows] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id=?`, [requestId]);
    if (!rows.length) return res.status(404).json({ error: "Request not found" });

    const request = rows[0];

    if (request.claimed_by_user_id !== req.user.user_id && req.user.role !== "admin")
      return res.status(403).json({ error: "Only claimant or admin can update" });

    await db.query(
      `UPDATE EquipmentRequests SET status=? WHERE request_id=?`,
      [status, requestId]
    );

    res.json({ message: "Status updated", status });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating status" });
  }
};
