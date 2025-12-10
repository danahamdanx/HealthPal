import { db } from '../config/db.js';

export const getAllDonors = async () => {
  const [rows] = await db.query(`SELECT * FROM donors`);
  return rows;
};

export const getDonorById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM donors WHERE donor_id=$1`, [id]);
  return rows[0];
};

export const createDonor = async (data) => {
  const { name, email, phone, address, total_donated, user_id } = data;

  const [rows] = await db.query(
    `INSERT INTO donors (name, email, phone, address, total_donated, user_id)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [name, email, phone, address, total_donated, user_id]
  );

  return rows[0];
};

export const updateDonor = async (id, data) => {
  const { name, email, phone, address, total_donated, user_id } = data;

  const [rows] = await db.query(
    `UPDATE donors SET
      name=$1, email=$2, phone=$3, address=$4, total_donated=$5, user_id=$6
    WHERE donor_id=$7 RETURNING *`,
    [name, email, phone, address, total_donated, user_id, id]
  );

  return rows[0];
};

export const deleteDonor = async (id) => {
  await db.query(`DELETE FROM donors WHERE donor_id=$1`, [id]);
  return true;
};
