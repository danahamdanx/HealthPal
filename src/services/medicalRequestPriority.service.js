// src/services/medicalRequestPriority.service.js
import { db } from '../config/db.js';

// نعطي لكل طلب "نقطة أولوية" حسب الurgency + status
export const fetchPrioritizedMedicalRequests = async ({ status = null, limit = 50 } = {}) => {
  const [rows] = await db.query(
    `
    SELECT
      mr.request_id,
      mr.patient_id,
      mr.item_name,
      mr.quantity,
      mr.urgency,
      mr.status,
      mr.notes,
      mr.created_at,
      p.name AS patient_name,
      (
        /* أولوية حسب الurgency */
        CASE mr.urgency
          WHEN 'critical' THEN 4
          WHEN 'high'     THEN 3
          WHEN 'medium'   THEN 2
          WHEN 'low'      THEN 1
          ELSE 0
        END
        +
        /* أولوية حسب الstatus */
        CASE mr.status
          WHEN 'pending'   THEN 2
          WHEN 'in_review' THEN 1
          ELSE 0
        END
      ) AS priority_score
    FROM MEDICALREQUESTS mr
    JOIN PATIENTS p ON mr.patient_id = p.patient_id
    /* لو بدك فلترة بالstatus (مثلاً بس pending) */
    WHERE ( ? IS NULL OR mr.status = ? )
    ORDER BY priority_score DESC, mr.created_at ASC
    LIMIT ?
    `,
    [status, status, limit]
  );

  return rows;
};