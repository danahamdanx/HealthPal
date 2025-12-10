// src/services/dashboard.service.js
import { db } from '../config/db.js';

// 🧑‍🦽 Patient Dashboard
export const getPatientDashboardData = async (userId) => {
  // نجيب بيانات الـ User نفسه
  const [userRows] = await db.query(
    'SELECT user_id, name, email, role, created_at FROM USERS WHERE user_id = ?',
    [userId]
  );
  const user = userRows[0];

  // نجيب patient_id من جدول PATIENTS
  const [patientRows] = await db.query(
    'SELECT * FROM PATIENTS WHERE user_id = ?',
    [userId]
  );
  const patient = patientRows[0];
  const patientId = patient?.patient_id;

  // 1) أقرب الاستشارات القادمة (CONSULTATIONS)
  const [upcomingConsultations] = await db.query(
    `SELECT c.consultation_id,
            c.scheduled_time,
            c.status,
            c.consultation_type,
            d.name AS doctor_name
     FROM CONSULTATIONS c
     JOIN DOCTORS d ON c.doctor_id = d.doctor_id
     WHERE c.patient_id = ?
       AND c.scheduled_time >= NOW()
     ORDER BY c.scheduled_time
     LIMIT 5`,
    [patientId]
  );

  // 2) جلسات العلاج (THERAPYSESSIONS) القادمة
  const [upcomingTherapySessions] = await db.query(
    `SELECT t.session_id,
            t.scheduled_time,
            t.status,
            t.session_focus,
            t.session_mode,
            d.name AS doctor_name
     FROM THERAPYSESSIONS t
     JOIN DOCTORS d ON t.doctor_id = d.doctor_id
     WHERE t.patient_id = ?
       AND t.scheduled_time >= NOW()
     ORDER BY t.scheduled_time
     LIMIT 5`,
    [patientId]
  );

  // 3) الحالات (CASES) الخاصة بالمريض
  const [cases] = await db.query(
    `SELECT case_id, title, status, verified, target_amount, raised_amount, created_at
     FROM CASES
     WHERE patient_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  // 4) طلبات طبية (MEDICALREQUESTS)
  const [medicalRequests] = await db.query(
    `SELECT request_id, item_name, quantity, urgency, status, created_at
     FROM MEDICALREQUESTS
     WHERE patient_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  // 5) طلبات المعدات (EQUIPMENTREQUESTS)
  const [equipmentRequests] = await db.query(
    `SELECT er.request_id,
            ei.name AS equipment_name,
            er.status,
            er.duration_days,
            er.created_at
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