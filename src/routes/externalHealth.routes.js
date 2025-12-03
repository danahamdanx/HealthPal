import express from "express";
import { fetchExternalHealthArticles } from "../controllers/externalHealth.controller.js";

const router = express.Router();

router.get("/external-articles", fetchExternalHealthArticles);

export default router;
