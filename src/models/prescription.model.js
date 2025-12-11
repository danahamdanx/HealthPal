const db = require("../config/db");

class Prescription {

    static createPrescription(doctorId, patientId, notes) {
        const sql = `
            INSERT INTO prescriptions (doctor_id, patient_id, notes)
            VALUES (?, ?, ?)
        `;
        return db.execute(sql, [doctorId, patientId, notes]);
    }

    static addMedicine(prescriptionId, name, dosage, duration, instructions) {
        const sql = `
            INSERT INTO prescriptions_medicines 
            (prescription_id, medicine_name, dosage, duration, instructions)
            VALUES (?, ?, ?, ?, ?)
        `;
        return db.execute(sql, [prescriptionId, name, dosage, duration, instructions]);
    }

    static getPrescriptionByPatient(patientId) {
        const sql = `
            SELECT * FROM prescriptions
            WHERE patient_id = ?
            ORDER BY created_at DESC
        `;
        return db.execute(sql, [patientId]);
    }

    static getPrescriptionDetails(prescriptionId) {
        const sql = `
            SELECT p.*, m.medicine_name, m.dosage, m.duration, m.instructions
            FROM prescriptions p
            LEFT JOIN prescriptions_medicines m 
            ON p.prescription_id = m.prescription_id
            WHERE p.prescription_id = ?
        `;
        return db.execute(sql, [prescriptionId]);
    }

    static updateStatus(prescriptionId, status) {
        const sql = `
            UPDATE prescriptions
            SET status = ?
            WHERE prescription_id = ?
        `;
        return db.execute(sql, [status, prescriptionId]);
    }
}

module.exports = Prescription;