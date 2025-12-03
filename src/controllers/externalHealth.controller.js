import axios from "axios";
import { db } from "../config/db.js";
import Parser from "rss-parser";

const parser = new Parser();

/** Fetch external health articles dynamically */
export const fetchExternalHealthArticles = async (req, res) => {
  try {
    const { language = "ar" } = req.query; // default عربي

    // مثال: مصدر خارجي باللغة العربية أو الإنجليزية
    const rssUrl = language === "en"
      ? "https://www.who.int/rss-feeds/news-english.xml"
      : "https://www.who.int/ar/rss-feeds/news.xml";

    const feed = await parser.parseURL(rssUrl);

    // تحويل الـ feed إلى JSON مناسب
    const articles = feed.items.map(item => ({
      title: item.title,
      category: item.categories ? item.categories.join(", ") : "general",
      content: item.contentSnippet || item.content || "",
      link: item.link,
      language
    }));

                // اختيارياً: يمكن حفظ المقالات في DB (HealthGuides) لتسهيل البحث لاحقاً
                 for (let art of articles) {
            await db.query(
                     `INSERT INTO HealthGuides (title, category, content, language, image_url)
                      VALUES (?, ?, ?, ?, ?)`,
                     [art.title, art.category, art.content, art.language, null]
                   );
                 }

    res.json(articles);

  } catch (err) {
    console.error("Error fetching external articles:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};
