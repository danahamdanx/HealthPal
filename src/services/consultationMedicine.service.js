// consultationMedicine.service.js
import { db } from '../config/db.js';
import { generatePrescriptionPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/mailer.js';

// Add a medicine to a consultation and send PDF by email
export const addMedicine = async (
  consultationId,
  doctorName,
  patientEmail,
  patientName,
  name,
  dosage,
  duration,
  instructions
) => {
  const sql = `
    INSERT INTO consultation_medicines 
    (consultation_id, name, dosage, duration, instructions)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [consultationId, name, dosage, duration, instructions]);

  // Generate PDF for the prescription
   const pdfPath = await generatePrescriptionPDF({
    prescriptionId: result.insertId, // Use the inserted medicine ID as reference
    patientName,
    doctorName,
    medicines: [
      {
        name,
        dosage,
        duration,
        instructions,
      }
    ]
  });

  // 3️⃣ Send PDF by email
  await sendEmail({
    email: patientEmail,
    subject: 'Your Prescription PDF',
    message: `Dear ${patientName},\n\nPlease find attached your prescription from Dr. ${doctorName}.`,
    attachments: [
      {
        filename: `prescription-${result.insertId}.pdf`,
        path: pdfPath,
      }
    ]
  });

  return result;
}

// Get all medicines for a consultation
export const getByConsultation = async (consultationId) => {
  const sql = `
    SELECT * FROM consultation_medicines
    WHERE consultation_id = ?
    ORDER BY created_at DESC
  `;
  return db.execute(sql, [consultationId]);
};
