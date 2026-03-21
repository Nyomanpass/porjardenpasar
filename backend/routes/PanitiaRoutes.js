import { Router } from "express";
import {
  getPanitia,
  createPanitia,
  updateStatusPanitia,
  deletePanitia,
  updatePanitia
} from "../controllers/PanitiaController.js";

const router = Router();

router.get("/panitia", getPanitia);
router.post("/panitia", createPanitia);
router.put("/panitia/:id/status", updateStatusPanitia);
router.delete("/panitia/:id", deletePanitia);
router.put("/panitia/:id", updatePanitia);

export default router;