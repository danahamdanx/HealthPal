import { db } from '../config/db.js';

export const getAllDonations = async () => {
  const [rows] = await db.query(`SELECT * FROM donations`);
  return rows;
};

export const getDonationById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM donations WHERE donation_id=$1`, [id]);
  return rows[0];
};

export const createDonation = async (data) => {
  const { donor_id, case_id, amount, donation_date } = data;

  const [rows] = await db.query(
    `INSERT INTO donations (donor_id, case_id, amount, donation_date)
    VALUES ($1,$2,$3,$4)
    RETURNING *`,
    [donor_id, case_id, amount, donation_date]
  );

  return rows[0];
};

export const updateDonation = async (id, data) => {
  const { donor_id, case_id, amount, donation_date } = data;

  const [rows] = await db.query(
    `UPDATE donations SET 
      donor_id=$1, case_id=$2, amount=$3, donation_date=$4
    WHERE donation_id=$5 RETURNING *`,
    [donor_id, case_id, amount, donation_date, id]
  );

  return rows[0];
};

export const deleteDonation = async (id) => {
  await db.query(`DELETE FROM donations WHERE donation_id=$1`, [id]);
  return true;
};
