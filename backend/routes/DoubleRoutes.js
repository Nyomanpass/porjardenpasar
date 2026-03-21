import express from "express";
import { createDoubleTeam, getDoubleTeams, deleteDoubleTeam } from "../controllers/DoubleTeamController.js";

const router = express.Router();

router.post("/double-teams", createDoubleTeam);
router.get('/double-teams', getDoubleTeams); 
router.delete('/double-teams/:id', deleteDoubleTeam);

export default router;