import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from "../controllers/AthleteController.js";

const router = express.Router();

// ======================
// MULTER CONFIG
// ======================
const uploadDir = path.join(process.cwd(), "uploads/athlete");
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
router.get("/athlete/get", getAthletes);
router.get("/athlete/get/:id", getAthleteById);
router.post("/athlete/create", upload.single("photo"), createAthlete);
router.put("/athlete/update/:id", upload.single("photo"), updateAthlete);
router.delete("/athlete/delete/:id", deleteAthlete);

export default router;
