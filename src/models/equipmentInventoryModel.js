import { db } from '../config/db.js';

export const getAllEquipment = async () => {
  const [rows] = await db.query(`SELECT * FROM equipmentinventory`);
  return rows;
};

export const getEquipmentById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM equipmentinventory WHERE equipment_id=$1`,
    [id]
  );
  return rows[0];
};

export const createEquipment = async (data) => {
  const [rows] = await db.query(
    `INSERT INTO equipmentinventory 
    (added_by_user_id, added_by_type, name, description, quantity,
     category, item_condition, availability_status, location, contact_info)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.added_by_user_id,
      data.added_by_type,
      data.name,
      data.description,
      data.quantity,
      data.category,
      data.item_condition,
      data.availability_status,
      data.location,
      data.contact_info
    ]
  );
  return rows[0];
};

export const updateEquipment = async (id, data) => {
  const [rows] = await db.query(
    `UPDATE equipmentinventory
     SET added_by_user_id=$1, added_by_type=$2, name=$3, description=$4, 
         quantity=$5, category=$6, item_condition=$7, availability_status=$8, 
         location=$9, contact_info=$10
     WHERE equipment_id=$11
     RETURNING *`,
    [
      data.added_by_user_id,
      data.added_by_type,
      data.name,
      data.description,
      data.quantity,
