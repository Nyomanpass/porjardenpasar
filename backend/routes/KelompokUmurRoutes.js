// routes/kelompokUmurRoute.js
import express from "express";
import { 
  getKelompokUmur, 
  getKelompokUmurById, 
  createKelompokUmur, 
  updateKelompokUmur, 
  deleteKelompokUmur 
} from "../controllers/KelompokUmurController.js";

const router = express.Router();

router.get("/kelompok-umur", getKelompokUmur);
router.get("/kelompok-umur/:id", getKelompokUmurById);
router.post("/kelompok-umur", createKelompokUmur);
router.put("/kelompok-umur/:id", updateKelompokUmur);
router.delete("/kelompok-umur/:id", deleteKelompokUmur);

export default router;
