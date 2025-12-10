import { db } from "../config/db.js";

// ================================
// 🧑‍🦽 PATIENT DASHBOARD
// ================================
export const getPatientDashboardData = async (userId) => {
  const [userRows] = await db.query(
    "SELECT user_id, name, email, role, created_at FROM USERS WHERE user_id = ?",
    [userId]
  );
  const user = userRows[0];

  const [patientRows] = await db.query(
    "SELECT * FROM PATIENTS WHERE user_id = ?",
    [userId]
  );
  const patient = patientRows[0];
  const patientId = patient?.patient_id;

  // Upcoming consultations
  const [upcomingConsultations] = await db.query(
    `SELECT c.consultation_id, c.scheduled_time, c.status, c.consultation_type,
            d.name AS doctor_name
     FROM CONSULTATIONS c
     JOIN DOCTORS d ON c.doctor_id = d.doctor_id
     WHERE c.patient_id = ?
       AND c.scheduled_time >= NOW()
     ORDER BY c.scheduled_time
     LIMIT 5`,
    [patientId]
  );

  // Therapy sessions
  const [upcomingTherapySessions] = await db.query(
    `SELECT t.session_id, t.scheduled_time, t.status, t.session_focus, t.session_mode,
            d.name AS doctor_name
     FROM THERAPYSESSIONS t
     JOIN DOCTORS d ON t.doctor_id = d.doctor_id
     WHERE t.patient_id = ?
       AND t.scheduled_time >= NOW()
     ORDER BY t.scheduled_time
     LIMIT 5`,
    [patientId]
  );

  const [cases] = await db.query(
    `SELECT case_id, title, status, verified, target_amount, raised_amount, created_at
     FROM CASES
     WHERE patient_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  const [medicalRequests] = await db.query(
    `SELECT request_id, item_name, quantity, urgency, status, created_at
     FROM MEDICALREQUESTS
     WHERE patient_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  const [equipmentRequests] = await db.query(
    `SELECT er.request_id, ei.name AS equipment_name, er.status,
            er.duration_days, er.created_at
     FROM EQUIPMENTREQUESTS er
     JOIN EQUIPMENTINVENTORY ei ON er.equipment_id = ei.equipment_id
     WHERE er.patient_id = ?
     ORDER BY er.created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return {
    user,
    patient,
    upcomingConsultations,
    upcomingTherapySessions,
    cases,
    medicalRequests,
    equipmentRequests,
  };
};

// ================================
// 👩‍⚕ DOCTOR DASHBOARD
// ================================
// 👩‍⚕ Doctor Dashboard
export const getDoctorDashboardData = async (userId) => {
  // نجيب بيانات الـ User
  const [userRows] = await db.query(
    'SELECT user_id, name, email, role, created_at FROM USERS WHERE user_id = ?',
    [userId]
  );
  const user = userRows[0];

  // نجيب doctor_id من جدول DOCTORS
  const [doctorRows] = await db.query(
    'SELECT * FROM doctors WHERE user_id = ?',
    [userId]
  );
  const doctor = doctorRows[0];
  const doctorId = doctor?.doctor_id;

  // 1) استشارات اليوم (CONSULTATIONS لليوم)
  const [todayConsultations] = await db.query(
    `SELECT c.consultation_id,
            c.scheduled_time,
            c.status,
            c.consultation_type,
            p.name AS patient_name
     FROM CONSULTATIONS c
     JOIN PATIENTS p ON c.patient_id = p.patient_id
     WHERE c.doctor_id = ?
       AND DATE(c.scheduled_time) = CURDATE()
     ORDER BY c.scheduled_time`,
    [doctorId]
  );

  // 2) جلسات العلاج لليوم (THERAPYSESSIONS)
  const [todayTherapySessions] = await db.query(
    `SELECT t.session_id,
            t.scheduled_time,
            t.status,
            t.session_focus,
            p.name AS patient_name
     FROM THERAPYSESSIONS t
     JOIN PATIENTS p ON t.patient_id = p.patient_id
     WHERE t.doctor_id = ?
       AND DATE(t.scheduled_time) = CURDATE()
     ORDER BY t.scheduled_time`,
    [doctorId]
  );

  // 3) آخر المرضى اللي تعامل معهم الدكتور (من الاستشارات وجلسات العلاج)
  const [recentPatients] = await db.query(
    `SELECT 
    p.patient_id,
    p.name,
    p.email,
    p.phone,
    MAX(c.scheduled_time) AS last_consultation
FROM PATIENTS p
JOIN CONSULTATIONS c ON c.patient_id = p.patient_id
WHERE c.doctor_id = ?
GROUP BY p.patient_id, p.name, p.email, p.phone
ORDER BY last_consultation DESC
LIMIT 10;
`,
    [doctorId]
  );

  return {
    user,
    doctor,
    todayConsultations,
    todayTherapySessions,
    recentPatients,
  };
};

// ================================
// 🏢 NGO DASHBOARD
// ================================
export const getNgoDashboardData = async (ngoId) => {
  const [[casesCount]] = await db.query(
   ` SELECT COUNT(*) AS total FROM CASES WHERE ngo_id = ?`,
    [ngoId]
  );

  const [[totalDonations]] = await db.query(
    `SELECT SUM(d.amount) AS total
     FROM DONATIONS d
     JOIN CASES c ON d.case_id = c.case_id
     WHERE c.ngo_id = ?`,
    [ngoId]
  );

  const [[activeCases]] = await db.query(
    `SELECT COUNT(*) AS total FROM CASES WHERE ngo_id = ? AND status = 'active'`,
    [ngoId]
  );

  const [[closedCases]] = await db.query(
    `SELECT COUNT(*) AS total FROM CASES WHERE ngo_id = ? AND status = 'closed'`,
    [ngoId]
  );

  const [[claimsCount]] = await db.query(
    `SELECT COUNT(*) AS total FROM REQUESTCLAIMS WHERE ngo_id = ?`,
    [ngoId]
  );

  return {
    casesCount: casesCount.total || 0,
    totalDonations: totalDonations.total || 0,
    activeCases: activeCases.total || 0,
    closedCases: closedCases.total || 0,
    claimsCount: claimsCount.total || 0,
  };
};

// ================================
// 💸 DONOR DASHBOARD
// ================================
export const getDonorDashboardData = async (donorId) => {
  const [[donationCount]] = await db.query(
   ` SELECT COUNT(*) AS total FROM DONATIONS WHERE donor_id = ?`,
    [donorId]
  );

  const [[totalDonated]] = await db.query(
    `SELECT SUM(amount) AS total FROM DONATIONS WHERE donor_id = ?`,
    [donorId]
  );

  const [[supportedCases]] = await db.query(
    `SELECT COUNT(DISTINCT case_id) AS total FROM DONATIONS WHERE donor_id = ?`,
    [donorId]
  );

  const [recentDonations] = await db.query(
    `SELECT d.amount, d.donation_date, c.title
     FROM DONATIONS d
     JOIN CASES c ON c.case_id = d.case_id
     WHERE d.donor_id = ?
     ORDER BY d.donation_date DESC
     LIMIT 5`,
    [donorId]
  );

  return {
    donationCount: donationCount.total || 0,
    totalDonated: totalDonated.total || 0,
    supportedCases: supportedCases.total || 0,
    recentDonations,
  };
};