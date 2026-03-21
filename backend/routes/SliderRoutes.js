import express from "express";
import path from "path";
import multer from "multer";
import {
  getAllSlider,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
} from "../controllers/SliderController.js";

const router = express.Router();

// ==============================
// Konfigurasi multer
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/slider"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ==============================
// Routes dengan prefix /slider
// ==============================
router.get("/slider/get", getAllSlider);
router.get("/slider/find/:idSlider", getSliderById);
router.post("/slider/create", upload.single("image"), createSlider);
router.put("/slider/update/:idSlider", upload.single("image"), updateSlider);
router.delete("/slider/delete/:idSlider", deleteSlider);

export default router;
