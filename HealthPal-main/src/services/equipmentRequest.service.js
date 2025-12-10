import { db } from '../config/db.js';
import { sendEmail } from '../utils/mailer.js';

export const createEquipmentRequestService = async (user, data) => {
  const { equipment_id, reason, duration_days } = data;
  const patient_id = user.patient_id;
  if (!patient_id) throw new Error("Patient only");
  if (!equipment_id) throw new Error("equipment_id required");

  const [eq] = await db.query(
    `SELECT availability_status FROM EquipmentInventory WHERE equipment_id = ?`,
    [equipment_id]
  );
  if (!eq.length) throw new Error("Equipment not found");
  if (eq[0].availability_status !== "available") throw new Error("Equipment unavailable");

  const [result] = await db.query(
    `INSERT INTO EquipmentRequests (equipment_id, patient_id, reason, duration_days) VALUES (?, ?, ?, ?)`,
    [equipment_id, patient_id, reason, duration_days]
  );

  const [request] = await db.query(
    `SELECT * FROM EquipmentRequests WHERE request_id = ?`,
    [result.insertId]
  );

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

  return request[0];
};

// Claim equipment request
export const claimEquipmentRequestService = async (request_id, user) => {
  const [rows] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id = ?`, [request_id]);
  if (!rows.length) throw new Error("Request not found");

  const request = rows[0];
  if (request.status !== "pending") throw new Error("Already claimed");

  const claimant_type = user.role;
  const claimant_user_id = user.user_id;

  await db.query(
    `UPDATE EquipmentRequests SET status='claimed', claimed_by_user_id=?, claimed_by_type=? WHERE request_id=?`,
    [claimant_user_id, claimant_type, request_id]
  );

  // Notify patient
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

  return { message: "Request claimed successfully" };
};

// Update equipment request status
export const updateEquipmentRequestStatusService = async (request_id, status, user) => {
  const allowed = ["pending", "claimed", "in_transit", "delivered"];
  if (!allowed.includes(status)) throw new Error("Invalid status");

  const [rows] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id=?`, [request_id]);
  if (!rows.length) throw new Error("Request not found");

  const request = rows[0];
  if (request.claimed_by_user_id !== user.user_id && user.role !== "admin") {
    throw new Error("Only claimant or admin can update");
  }

  await db.query(`UPDATE EquipmentRequests SET status=? WHERE request_id=?`, [status, request_id]);
  return { message: "Status updated", status };
};

export const deleteEquipmentRequestService = async (request_id, user) => {
  const [rows] = await db.query(`SELECT * FROM EquipmentRequests WHERE request_id = ?`, [request_id]);
  if (!rows.length) throw new Error("Request not found");

  const request = rows[0];
  if (request.patient_id !== user.patient_id && user.role !== "admin") {
    throw new Error("Not authorized to delete this request");
  }

  await db.query(`DELETE FROM EquipmentRequests WHERE request_id = ?`, [request_id]);
  return { message: "Equipment request deleted successfully" };
};
