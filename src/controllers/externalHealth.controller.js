// src/controllers/healthArticles.controller.js
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { db } from "../config/db.js";
import Parser from "rss-parser";  // استيراد المكتبة


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
/** Fetch and store English health articles */
const parser = new Parser();      // إنشاء instance لاستخدامه

export const fetchAndStoreEnglishArticles = async (req, res) => {
  try {
    const rssUrl = "https://www.who.int/rss-feeds/news-english.xml";
    const feed = await parser.parseURL(rssUrl);

    const articles = feed.items.map(item => ({
      title: item.title,
      category: item.categories ? item.categories.join(", ") : "general",
      content: item.contentSnippet || item.content || "",
      image_url: null,
      language: "en"
    }));

    // حفظ المقالات بدون تكرار حسب العنوان + اللغة
    for (let art of articles) {
      const [existing] = await db.query(
        `SELECT * FROM HealthGuides WHERE title = ? AND language = ?`,
        [art.title, art.language]
      );

      if (!existing.length) {
        await db.query(
          `INSERT INTO HealthGuides (title, category, content, language, image_url)
           VALUES (?, ?, ?, ?, ?)`,
          [art.title, art.category, art.content, art.language, art.image_url]
        );
      }
    }

res.json({
  count: articles.length,
  articles  // هذا يعرض جميع المقالات اللي جلبناها من الـ RSS
});

  } catch (err) {
    console.error("Error fetching or storing English articles:", err);
    res.status(500).json({ error: "Failed to fetch/store English articles" });
  }
};
