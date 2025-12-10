// src/services/cdcAlerts.service.js
import axios from 'axios';
import { db } from '../config/db.js';

const CDC_BASE_URL = 'https://tools.cdc.gov/api/v2/resources/media';

/**
 * جلب Alerts من CDC مباشرة (بدون تخزين)
 * options:
 *  - topic: موضوع مثل Emergencies, Outbreaks... (اختياري)
 *  - max: عدد النتائج (افتراضي 20)
 */
export const fetchCdcAlertsFromApi = async ({ topic = 'Emergencies', max = 20 } = {}) => {
  const params = {
    // نحدد اللغة إنجليزي
    languageisocode: 'eng',
    // نفلتر حسب topic (مثلاً "Emergencies" أو "Outbreaks")
    topic,
    // نجيب أحدث الأشياء أولاً
    sort: 'datePublished',
    order: 'DESC',
    max,
  };

  const { data } = await axios.get(CDC_BASE_URL, { params });

  // الـ API بيرجع meta + results
  const results = data.results || [];

  // نرجّع شكل أخفّ شوية
  return results.map((item) => ({
    cdc_id: item.id,
    title: item.name,
    description: item.description,
    sourceUrl: item.sourceUrl || item.targetUrl,
    datePublished: item.datePublished,
    region:
      item.geoTags && item.geoTags.length > 0
        ? item.geoTags[0].name
        : 'Global / US',
    tags: (item.tags || []).map((t) => t.name),
  }));
};


/**
 * جلب Alerts من CDC + تخزينها في جدول PUBLICHEALTHALERTS
 * نحاول ما نكرّر نفس الـ alert (بنعتمد على cdc_id أو sourceUrl)
 */
export const syncCdcAlertsToDb = async ({ topic = 'Emergencies', max = 20 } = {}) => {
  const alerts = await fetchCdcAlertsFromApi({ topic, max });

  let insertedCount = 0;

  for (const alert of alerts) {
    const {
      cdc_id,
      title,
      description,
      sourceUrl,
      datePublished,
      region,
      tags,
    } = alert;

    // نتحقق إذا أصلاً مخزّن (حسب sourceUrl أو العنوان)
    const [existing] = await db.query(
      `SELECT alert_id 
       FROM PUBLICHEALTHALERTS 
       WHERE message LIKE ? OR title = ?
       LIMIT 1`,
      [`%${sourceUrl || ''}%, title`]
    );

    if (existing.length > 0) {
      continue; // موجود من قبل، نتجاوزه
    }

    const message =
      description ||
      `More info: ${sourceUrl || 'Visit CDC website for details.'}`;

    // نحدد نوع ودرجة الخطورة بشكل بسيط
    let severity = 'medium';
    const lowerTitle = (title || '').toLowerCase();
    if (lowerTitle.includes('outbreak') || lowerTitle.includes('emergency')) {
      severity = 'high';
    }

    const alertType = 'cdc_public_health';

    await db.query(
      `
      INSERT INTO PUBLICHEALTHALERTS
        (title, message, alert_type, region, severity, created_at, expires_at)
      VALUES
        (?, ?, ?, ?, ?, NOW(), NULL)
      `,
      [title, message, alertType, region, severity]
    );

    insertedCount++;
  }

  return {
    totalFromCdc: alerts.length,
    insertedCount,
  };
};