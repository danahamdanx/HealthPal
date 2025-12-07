// src/controllers/equipmentRequests.controller.js
import { db } from "../config/db.js";
import { sendEmail } from "../utils/mailer.js";

export const createEquipmentRequest = async (req, res) => {
  try {
    const { equipment_id, reason, duration_days } = req.body;
    const patient_id = req.user.patient_id;
    if (!patient_id) return res.status(403).json({ error: "Patient only" });
    if (!equipment_id) return res.status(400).json({ error: "equipment_id required" });

    const [eq] = await db.query(`SELECT availability_status FROM EquipmentInventory WHERE equipment_id = ?`, [equipment_id]);
    if (!eq.length) return res.status(404).json({ error: "Equipment not found" });
    if (eq[0].availability_status !== "available") return res.status(400).json({ error: "Equipment unavailable" });

    const [result] = await db.query(
      `INSERT INTO EquipmentRequests (equipment_id, patient_id, reason, duration_days) VALUES (?, ?, ?, ?)`,
      [equipment_id, patient_id, reason, duration_days]
    );

    const [request] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id = ?`, [result.insertId]);

    // Send email to patient confirming request
    const [patientRows] = await db.query(`SELECT name, email FROM Patients WHERE patient_id = ?`, [patient_id]);
    const patient = patientRows[0];
    if (patient?.email) {
      await sendEmail({
        email: patient.email,
        subject: "Equipment Request Submitted",
        message: `Hello ${patient.name}, your equipment request has been submitted successfully.`,
        html: `<p>Hello <strong>${patient.name}</strong>,</p><p>Your equipment request for equipment ID <strong>${equipment_id}</strong> has been submitted successfully.</p>`
      });
    }

    res.status(201).json(request[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating equipment request" });
  }
};

export const claimEquipmentRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const [rows] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id = ?`, [requestId]);
    if (!rows.length) return res.status(404).json({ error: "Request not found" });

    const request = rows[0];
    if (request.status !== "pending") return res.status(400).json({ error: "Already claimed" });

    const claimant_type = req.user.role;
    const claimant_user_id = req.user.user_id;

    await db.query(
      `UPDATE EquipmentRequests SET status='claimed', claimed_by_user_id=?, claimed_by_type=? WHERE request_id=?`,
      [claimant_user_id, claimant_type, requestId]
    );

    // Send email to patient notifying claim
    const [patientRows] = await db.query(`SELECT name, email FROM Patients WHERE patient_id = ?`, [request.patient_id]);
    const patient = patientRows[0];
    if (patient?.email) {
      await sendEmail({
        email: patient.email,
        subject: "Equipment Request Claimed",
        message: `Hello ${patient.name}, your equipment request has been claimed by ${claimant_type}.`,
        html: `<p>Hello <strong>${patient.name}</strong>,</p><p>Your equipment request has been claimed by <strong>${claimant_type}</strong>.</p>`
      });
    }

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
