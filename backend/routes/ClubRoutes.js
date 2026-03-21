import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
} from "../controllers/ClubController.js";

const router = express.Router();

// ======================
// MULTER CONFIG
// ======================
const uploadDir = path.join(process.cwd(), "uploads/club");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".png", ".jpg", ".jpeg"].includes(ext)) cb(null, true);
    else cb(new Error("File harus berupa gambar"));
  },
});

// ======================
// ROUTES
// ======================
router.get("/club/get", getClubs);
router.get("/club/get/:id", getClubById);
router.post("/club/create", upload.single("photo"), createClub);
router.put("/club/update/:id", upload.single("photo"), updateClub);
router.delete("/club/delete/:id", deleteClub);

export default router;
