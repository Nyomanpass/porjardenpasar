import { Router } from "express";
import { register, login, me, updateProfile, changePassword} from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/Auth.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);
router.put("/auth/profile", requireAuth, updateProfile);
router.put("/auth/change-password", requireAuth, changePassword);

export default router;
