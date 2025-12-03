// src/controllers/healthArticles.controller.js
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { db } from "../config/db.js";

/* ---------------------------
   Get Arabic articles from DB
--------------------------- */
export const getArabicArticles = async (req, res) => {
  try {
    const [articles] = await db.query(
      "SELECT * FROM HealthGuides WHERE language = 'ar' ORDER BY created_at DESC"
    );
    res.json(articles);
  } catch (err) {
    console.error("Error fetching Arabic articles:", err);
    res.status(500).json({ error: "Failed to fetch Arabic articles" });
  }
};

/* ---------------------------
   Get English articles from RSS feed & store in DB
--------------------------- */
export const fetchAndStoreEnglishArticles = async (req, res) => {
  try {
    const rssUrl = "https://www.who.int/rss-feeds/news-english.xml";
    const response = await axios.get(rssUrl);
    const xmlData = response.data;

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonData = parser.parse(xmlData);
    const items = jsonData.rss?.channel?.item || [];

    for (let item of items) {
      const title = item.title || "";
      const category = item.category || "general";
      const content = item.description || "";
      const link = item.link || "";

      if (!link) continue; // نتجاهل المقالات بدون رابط

      // تحقق من التكرار
      const [existing] = await db.query(
        "SELECT * FROM HealthGuides WHERE link = ?",
        [link]
      );

      if (!existing.length) {
        await db.query(
          `INSERT INTO HealthGuides (title, category, content, language, link)
           VALUES (?, ?, ?, 'en', ?)`,
          [title, category, content, link]
        );
      }
    }

    // جلب جميع المقالات الإنجليزية بعد التخزين
    const [englishArticles] = await db.query(
      "SELECT * FROM HealthGuides WHERE language = 'en' ORDER BY created_at DESC"
    );

    res.json(englishArticles);

  } catch (err) {
    console.error("Error fetching or storing English articles:", err);
    res.status(500).json({ error: "Failed to fetch/store English articles" });
  }
};
