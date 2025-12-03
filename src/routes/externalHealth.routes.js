import express from "express";
import {
    getArabicArticles,
fetchAndStoreEnglishArticles
} from "../controllers/externalHealth.controller.js";
const router = express.Router();

// Arabic articles from DB
router.get("/ar", getArabicArticles);

// English articles from RSS feed + store
router.get("/en", fetchAndStoreEnglishArticles);


export default router;
