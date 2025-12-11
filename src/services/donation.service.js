// src/services/donation.service.js

import { db } from '../config/db.js';
import { generateDonationInvoice } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/mailer.js';


// ======================================================
// 1) CREATE DONATION + SEND INVOICE
// ======================================================

export const createDonationService = async ({ donor_id, case_id, amount }) => {
  if (!donor_id || !case_id || !amount) throw new Error('Missing required fields');

  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0)
    throw new Error('Invalid donation amount');

  // Check case
  const [caseRows] = await db.query(
    `SELECT case_id, target_amount, raised_amount, verified, status, title 
     FROM Cases WHERE case_id = ?`,
    [case_id]
  );
  if (!caseRows.length) throw new Error('Case not found');

  const caseData = caseRows[0];
  if (!caseData.verified)
    throw new Error('Case not verified yet');

  // Insert donation
  await db.query(
    `INSERT INTO Donations (donor_id, case_id, amount) VALUES (?, ?, ?)`,
    [donor_id, case_id, donationAmount]
  );

  // Update case raised_amount & status
  const newRaised = parseFloat(caseData.raised_amount || 0) + donationAmount;
  const newStatus = newRaised >= caseData.target_amount ? 'completed' : 'in_progress';

  await db.query(
    `UPDATE Cases SET raised_amount = ?, status = ? WHERE case_id = ?`,
    [newRaised, newStatus, case_id]
  );

  // Update donor's total donations
  await db.query(
    `UPDATE Donors SET total_donated = total_donated + ? WHERE donor_id = ?`,
    [donationAmount, donor_id]
  );

  // Fetch donor info
  const [donorRows] = await db.query(
    `SELECT name, email FROM Donors WHERE donor_id = ?`,
    [donor_id]
  );
  const donor = donorRows[0];

  // Generate PDF invoice
  const pdfPath = await generateDonationInvoice({
    donorName: donor.name,
    caseTitle: caseData.title,
    amount: donationAmount,
    date: new Date().toLocaleDateString()
  });

  // Email invoice to donor
  if (donor.email) {
    await sendEmail({
      email: donor.email,
      subject: 'Donation Invoice',
      message:` Hello ${donor.name},\n\nThank you for your donation of $${donationAmount} to "${caseData.title}".\nPlease find your invoice attached.\n\nBest regards.`,
      html: `<p>Hello ${donor.name},</p>
             <p>Thank you for your donation of <strong>$${donationAmount}</strong> to "<strong>${caseData.title}</strong>".</p>
             <p>Please find your invoice attached.</p>`,
      attachments: [
        {
          filename:` invoice-${Date.now()}.pdf`,
          path: pdfPath
        }
      ]
    });
  }

  return {
    updated_case: {
      case_id,
      raised_amount: newRaised,
      status: newStatus
    },
    invoice: pdfPath
  };
};



// ======================================================
// 2) DONOR DONATION HISTORY + STATS (My Donations)
// ======================================================

export const getDonorDonationsService = async (donor_id) => {
  // Bring all donations with case title
  const [rows] = await db.query(
    `SELECT d.donation_id, d.amount, d.donation_date,
            c.case_id, c.title AS case_title
     FROM Donations d
     JOIN Cases c ON d.case_id = c.case_id
     WHERE d.donor_id = ?
     ORDER BY d.donation_date DESC`,
    [donor_id]
  );

  // Stats
  const totalAmount = rows.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const uniqueCases = new Set(rows.map(r => r.case_id)).size;

  return {
    stats: {
      total_donated: totalAmount,
      donations_count: rows.length,
      supported_cases_count: uniqueCases
    },
    donations: rows
  };
};



// ======================================================
// 3) CASE DONATION SUMMARY (For Admin / NGO)
// ======================================================

export const getCaseDonationsSummaryService = async (case_id) => {
  // Fetch case
  const [[caseRow]] = await db.query(
    `SELECT case_id, title, target_amount, raised_amount, status
     FROM Cases
     WHERE case_id = ?`,
    [case_id]
  );

  if (!caseRow) throw new Error('Case not found');

  // Donations with donor names
  const [donations] = await db.query(
    `SELECT d.donation_id, d.amount, d.donation_date,
            r.donor_id, r.name AS donor_name
     FROM Donations d
     JOIN Donors r ON d.donor_id = r.donor_id
     WHERE d.case_id = ?
     ORDER BY d.donation_date DESC`,
    [case_id]
  );

  const coverage =
    caseRow.target_amount > 0
      ? Math.min(100, (Number(caseRow.raised_amount || 0) / Number(caseRow.target_amount)) * 100)
      : 0;

  return {
    case: {
      case_id: caseRow.case_id,
      title: caseRow.title,
      target_amount: caseRow.target_amount,
      raised_amount: caseRow.raised_amount,
      status: caseRow.status,
      coverage_percent: Number(coverage.toFixed(2))
    },
    donations
  };
};