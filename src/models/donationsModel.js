// src/models/donations.model.js
import { db } from '../config/db.js';

export const getAllDonations = async () => {
  const [rows] = await db.query(`SELECT * FROM Donations`);
  return rows;
};

export const getDonationById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM Donations WHERE donation_id = ?`,
    [id]
  );
  return rows[0];
};

export const createDonation = async (data) => {
  const { donor_id, case_id, amount, donation_date } = data;

  const [result] = await db.query(
    `INSERT INTO Donations (donor_id, case_id, amount, donation_date)
     VALUES (?, ?, ?, ?)`,
    [donor_id, case_id, amount, donation_date]
  );

  const insertId = result.insertId;
  const [rows] = await db.query(
    `SELECT * FROM Donations WHERE donation_id = ?`,
    [insertId]
  );
  return rows[0];
};

export const updateDonation = async (id, data) => {
  const { donor_id, case_id, amount, donation_date } = data;

  await db.query(
    `UPDATE Donations SET 
       donor_id = ?, 
       case_id = ?, 
       amount = ?, 
       donation_date = ?
     WHERE donation_id = ?`,
    [donor_id, case_id, amount, donation_date, id]
  );

  const [rows] = await db.query(
    `SELECT * FROM Donations WHERE donation_id = ?`,
    [id]
  );
  return rows[0];
};

export const deleteDonation = async (id) => {
  await db.query(
    `DELETE FROM Donations WHERE donation_id = ?`,
    [id]
  );
  return true;
};