import { db } from "../config/db.js";

/** Create equipment item */
export const createEquipmentService = async (data, user) => {
  const { name, description, quantity = 1, category, item_condition, location, contact_info } = data;

  if (!name) throw new Error("Name is required");

  const added_by_user_id = user.user_id;
  const added_by_type = user.role;

  const [result] = await db.query(
    `INSERT INTO EquipmentInventory 
    (added_by_user_id, added_by_type, name, description, quantity, category, item_condition, location, contact_info)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [added_by_user_id, added_by_type, name, description, quantity, category, item_condition, location, contact_info]
  );

  const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [result.insertId]);
  return rows[0];
};

/** Get all equipment */
export const getAllEquipmentService = async () => {
  const [rows] = await db.query(`SELECT * FROM EquipmentInventory ORDER BY created_at DESC`);
  return rows;
};

/** Get equipment by category */
export const getEquipmentByCategoryService = async (category) => {
  if (!category) throw new Error("Category is required");
  const [rows] = await db.query(
    `SELECT * FROM EquipmentInventory WHERE category = ? ORDER BY created_at DESC`,
    [category]
  );
  return rows;
};

/** Get equipment by id */
export const getEquipmentByIdService = async (id) => {
  const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [id]);
  if (!rows.length) throw new Error("Equipment not found");
  return rows[0];
};

/** Update equipment */
export const updateEquipmentService = async (id, data, user) => {
  const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [id]);
  if (!rows.length) throw new Error("Not found");

  const eq = rows[0];
  if (user.role !== "admin" && user.user_id !== eq.added_by_user_id) throw new Error("Not authorized");

  await db.query(`UPDATE EquipmentInventory SET ? WHERE equipment_id = ?`, [data, id]);
  const [updated] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [id]);
  return updated[0];
};

/** Delete equipment */
export const deleteEquipmentService = async (id, user) => {
  const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [id]);
  if (!rows.length) throw new Error("Not found");

  const eq = rows[0];
  if (user.role !== "admin" && user.user_id !== eq.added_by_user_id) throw new Error("Not authorized");

  await db.query(`DELETE FROM EquipmentInventory WHERE equipment_id = ?`, [id]);
  return { message: "Deleted successfully" };
};
