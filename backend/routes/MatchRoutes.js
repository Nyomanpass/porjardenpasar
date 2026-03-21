import express from "express";
import { updateWinner, setMatchPeserta, generateUndian, getMatches, 
    getJuara, updateMatchPoint, getMatchDetailHistory, getMatchLog,
    undoLastPoint, getMatchLogs, setScoreRuleToMatch, getMatchById, 
    resetMatchScore, manualWOPoint, updateMatchDuration } from "../controllers/MatchController.js";
import { requireAuth } from "../middleware/Auth.js";

const router = express.Router();

// PATCH /api/matches/:matchId/winner → update pemenang
router.patch("/:matchId/winner", requireAuth, updateWinner);

// PATCH /api/matches/:matchId/peserta → set peserta manual
router.patch("/:matchId/peserta", setMatchPeserta);
router.post("/bagan/:id/undian", generateUndian);
router.get("/matches", getMatches);
router.get("/juara/:baganId", getJuara);
router.post('/update-point', updateMatchPoint);
router.get('/history/:matchId', getMatchDetailHistory);
router.get('/match-log/:id', getMatchLog);
router.delete('/undo-point/:id', undoLastPoint);
router.get("/match-logs/:matchId", getMatchLogs); // Untuk SkorPage
router.patch("/matches/:id/set-rule", setScoreRuleToMatch);
router.get("/matches/:id", getMatchById);
router.delete("/reset-match/:id", resetMatchScore);
router.post("/matches/manual-wo-point", manualWOPoint);
router.patch("/matches/:id/duration", updateMatchDuration);



export default router;