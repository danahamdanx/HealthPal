import express from "express";
import {
    getArabicArticles,
fetchAndStoreEnglishArticles
} from "../controllers/externalHealth.controller.js";
const router = express.Router();

router.get("/external-arabic_articles", getArabicArticles);
router.get("/external-english_articles", fetchAndStoreEnglishArticles);


export default router;
