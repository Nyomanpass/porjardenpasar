import { Router } from "express";
import {
  getWasit,
  createWasit,
  updateStatusWasit,
  deleteWasit,
  updateWasit
} from "../controllers/WasitController.js";

const router = Router();

router.get("/wasit", getWasit);
router.post("/wasit", createWasit);
router.put("/wasit/:id/status", updateStatusWasit);
router.delete("/wasit/:id", deleteWasit);
router.put("/wasit/:id", updateWasit);


export default router;
