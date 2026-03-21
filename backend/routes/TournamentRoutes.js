import express from "express";
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  uploadPoster,
} from "../controllers/TournamentController.js";

const router = express.Router();

router.get("/tournaments", getTournaments);
router.get("/tournaments/:id", getTournamentById);
router.post("/tournaments", uploadPoster.single("poster"), createTournament);
router.put("/tournaments/:id", uploadPoster.single("poster"), updateTournament);
router.delete("/tournaments/:id", deleteTournament);

export default router;
