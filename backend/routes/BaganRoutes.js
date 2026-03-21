import express from "express";
import { createBagan, getBaganWithMatches, getAllBagan, deleteBagan, lockBagan} from "../controllers/BaganController.js";

const router = express.Router();

router.post("/bagan", createBagan);
router.get("/bagan", getAllBagan); // <- endpoint baru untuk list bagan
router.get("/bagan/:id", getBaganWithMatches);
router.delete('/bagan/:id', deleteBagan);
router.patch('/bagan/:id/lock', lockBagan);

export default router;
