// src/controllers/equipmentInventory.controller.js
import { db } from "../config/db.js";

/** Create equipment item (NGO / Donor / Hospital / Pharmacy / Admin) */
export const createEquipment = async (req, res) => {
  try {
    const { name, description, quantity = 1, category, item_condition, location, contact_info } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const added_by_user_id = req.user.user_id;     // always available after auth
    const added_by_type = req.user.role;           // ngo, donor, admin, hospital, pharmacy

    const [result] = await db.query(
      `INSERT INTO EquipmentInventory 
      (added_by_user_id, added_by_type, name, description, quantity, category, item_condition, location, contact_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [added_by_user_id, added_by_type, name, description, quantity, category, item_condition, location, contact_info]
    );

    const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating equipment" });
  }
};


/** Get all equipment */
export const getAllEquipment = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM EquipmentInventory ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching equipment" });
  }
};


/** Get equipment by id */
export const getEquipmentById = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Equipment not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching equipment" });
  }
};


/** Update equipment (only owner or admin) */
export const updateEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [equipmentId]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const eq = rows[0];

    if (req.user.role !== "admin" && req.user.user_id !== eq.added_by_user_id)
      return res.status(403).json({ error: "Not authorized" });

    const fields = req.body;

    await db.query(
      `UPDATE EquipmentInventory SET ? WHERE equipment_id = ?`,
      [fields, equipmentId]
    );

    const [updated] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [equipmentId]);
    res.json(updated[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating equipment" });
  }
};


/** Delete equipment */
export const deleteEquipment = async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const [rows] = await db.query(`SELECT * FROM EquipmentInventory WHERE equipment_id = ?`, [equipmentId]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const eq = rows[0];

    if (req.user.role !== "admin" && req.user.user_id !== eq.added_by_user_id)
      return res.status(403).json({ error: "Not authorized" });

    await db.query(`DELETE FROM EquipmentInventory WHERE equipment_id = ?`, [equipmentId]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting equipment" });
  }
};
