// src/services/ngoReports.service.js
import { db } from '../config/db.js';

// 🔹 1) Summary للـ NGO
export const getNgoSummary = async (ngoId) => {
  // معلومات الـ NGO
  const [ngoRows] = await db.query(
    `SELECT ngo_id, name, mission, email, phone 
     FROM NGOS 
     WHERE ngo_id = ?`,
    [ngoId]
  );
  const ngo = ngoRows[0];

  if (!ngo) {
    throw new Error('NGO not found');
  }

  // عدد الحالات
  const [[caseCounts]] = await db.query(
    `SELECT 
        COUNT(*) AS totalCases,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCases,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closedCases
     FROM CASES
     WHERE ngo_id = ?`,
    [ngoId]
  );

  // إجمالي التبرعات (على كل الحالات التابعة لهاي الـ NGO)
  const [[totalDonationsRow]] = await db.query(
    `SELECT 
        SUM(d.amount) AS totalDonations
     FROM DONATIONS d
     JOIN CASES c ON d.case_id = c.case_id
     WHERE c.ngo_id = ?`,
    [ngoId]
  );

  // عدد الـ claims (اختياري)
  const [[claimsCountRow]] = await db.query(
    `SELECT COUNT(*) AS totalClaims
     FROM REQUESTCLAIMS
     WHERE ngo_id = ?`,
    [ngoId]
  );

  return {
    ngo,
    stats: {
      totalCases: caseCounts.totalCases || 0,
      activeCases: caseCounts.activeCases || 0,
      closedCases: caseCounts.closedCases || 0,
      totalDonations: totalDonationsRow.totalDonations || 0,
      totalClaims: claimsCountRow.totalClaims || 0,
    },
  };
};

// 🔹 2) تبرعات حسب الشهر
export const getNgoDonationsByMonth = async (ngoId) => {
  const [rows] = await db.query(
    `SELECT 
        YEAR(d.donation_date) AS year,
        MONTH(d.donation_date) AS month,
        SUM(d.amount) AS totalAmount,
        COUNT(*) AS donationsCount
     FROM DONATIONS d
     JOIN CASES c ON d.case_id = c.case_id
     WHERE c.ngo_id = ?
     GROUP BY YEAR(d.donation_date), MONTH(d.donation_date)
     ORDER BY YEAR(d.donation_date), MONTH(d.donation_date)`,
    [ngoId]
  );

  return rows; // array جاهز لعرضه كـ chart بالفرونت اند
};

// 🔹 3) Top cases حسب التبرعات
export const getNgoTopCases = async (ngoId, limit = 5) => {
  const [rows] = await db.query(
    `SELECT 
        c.case_id,
        c.title,
        c.status,
        c.verified,
        c.target_amount,
        c.raised_amount,
        (SELECT COALESCE(SUM(d.amount), 0)
         FROM DONATIONS d
         WHERE d.case_id = c.case_id) AS totalDonations
     FROM CASES c
     WHERE c.ngo_id = ?
     ORDER BY totalDonations DESC
     LIMIT ?`,
    [ngoId, limit]
  );

  return rows;
};