import { DoctorDocuments } from "../models/doctorDocuments.model.js";

export const uploadDoctorDocument = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fileUrl, fileType } = req.body;

    if (!fileUrl)
      return res.status(400).json({ error: "fileUrl is required" });

    await DoctorDocuments.addDocument(
      doctorId,
      fileUrl,
      fileType || "other"
    );

    res.json({ message: "Document uploaded successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading document" });
  }
};

export const getDoctorDocuments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const [rows] = await DoctorDocuments.getDocumentsByDoctor(doctorId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching documents" });
  }
};

export const deleteDoctorDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    await DoctorDocuments.deleteDocument(documentId);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting document" });
  }
};