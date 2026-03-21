// routes/LapanganRoute.js
import express from "express";
import {
  createLapangan,
  getLapangan,
  getLapanganById,
  updateLapangan,
  deleteLapangan,
} from "../controllers/LapanganController.js";

const router = express.Router();

router.post("/lapangan", createLapangan);
router.get("/lapangan", getLapangan);
router.get("/lapangan/:id", getLapanganById);
router.put("/lapangan/:id", updateLapangan);
router.delete("/lapangan/:id", deleteLapangan);

export default router;
