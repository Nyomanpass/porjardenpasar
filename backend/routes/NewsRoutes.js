import express from "express";
import path from "path";
import multer from "multer";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsBySlug
} from "../controllers/NewsController.js";

const router = express.Router();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/news"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes dengan prefix /news
router.get("/news/get", getAllNews);
router.get("/news/find/:idNews", getNewsById);
router.post("/news/create", upload.single("image"), createNews);
router.put("/news/update/:idNews", upload.single("image"), updateNews);
router.delete("/news/delete/:idNews", deleteNews);
router.get("/news/slug/:slug", getNewsBySlug);

export default router;
