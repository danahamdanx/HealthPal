import { db } from '../config/db.js';

export const DoctorDocuments = {

  addDocument: (doctorId, fileUrl, fileType) => {
    return db.query(
      `INSERT INTO doctor_documents (doctor_id, file_url, file_type)
       VALUES (?, ?, ?)`,
      [doctorId, fileUrl, fileType]
    );
  },

  getDocumentsByDoctor: (doctorId) => {
    return db.query(
      `SELECT * FROM doctor_documents
       WHERE doctor_id = ?
       ORDER BY uploaded_at DESC`,
      [doctorId]
    );
  },

  deleteDocument: (documentId) => {
    return db.query(
      `DELETE FROM doctor_documents WHERE document_id = ?`,
      [documentId]
    );
  }
};