import express from "express";
import {
  getScoreRules,
  createScoreRule,
  updateScoreRule,
  deleteScoreRule,
  getScoreRuleById
} from "../controllers/ScoreRuleController.js";

const router = express.Router();

router.get("/score-rules", getScoreRules);
router.get("/score-rules/:id", getScoreRuleById); 
router.post("/score-rules", createScoreRule);
router.put("/score-rules/:id", updateScoreRule);
router.delete("/score-rules/:id", deleteScoreRule);

export default router;
