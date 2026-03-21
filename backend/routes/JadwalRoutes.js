import express from "express";
import { getJadwal, getJadwalByTanggal, createJadwal, updateStatusJadwal, deleteJadwal, updateJadwal } from "../controllers/JadwalController.js";

const router = express.Router();

router.get("/jadwal", getJadwal);
router.get("/jadwal/hari/:tanggal", getJadwalByTanggal);
router.post("/jadwal", createJadwal);
router.put("/jadwal/:id/status", updateStatusJadwal);
router.put("/jadwal/:id", updateJadwal);
router.delete("/jadwal/:id", deleteJadwal);

export default router;
