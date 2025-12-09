import * as equipmentService from "../services/equipmentInventory.service.js";

export const createEquipment = async (req, res) => {
  try {
    const equipment = await equipmentService.createEquipmentService(req.body, req.user);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const rows = await equipmentService.getAllEquipmentService();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEquipmentByCategory = async (req, res) => {
  try {
    const rows = await equipmentService.getEquipmentByCategoryService(req.params.category);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await equipmentService.getEquipmentByIdService(req.params.id);
    res.json(equipment);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const equipment = await equipmentService.updateEquipmentService(req.params.id, req.body, req.user);
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const result = await equipmentService.deleteEquipmentService(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
