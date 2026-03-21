// routes/adminRoutes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/Auth.js";

const router = Router();

router.get("/admin/summary", requireAuth, requireRole("admin"), (req, res) => {
  res.json({ message: "Admin summary data", who: req.user });
});

export default router;
