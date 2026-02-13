import express from "express";
import { generateCoverLetter } from "../controllers/aiController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// AI-powered cover letter generation
router.post("/generate-cover-letter", userAuthMiddleware, generateCoverLetter);

export default router;
