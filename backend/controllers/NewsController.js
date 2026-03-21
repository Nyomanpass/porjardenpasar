import { News } from "../models/NewsModel.js";
import path from "path";
import fs from "fs";


const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};


// Helper gambar untuk frontend 
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

// ===================================
// GET ALL NEWS
// ===================================
export const getAllNews = async (req, res) => {
  try {
    const news = await News.findAll();

    const result = news.map(n => ({
      ...n.toJSON(),
      image: getFullImageUrl(req, n.image),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data news" });
  }
};

// ===================================
// GET NEWS BY ID
// ===================================
export const getNewsById = async (req, res) => {
  try {
    const { idNews } = req.params;
    const news = await News.findByPk(idNews);

    if (!news) {
      return res.status(404).json({ message: "News tidak ditemukan" });
    }

    res.json({
      ...news.toJSON(),
      image: getFullImageUrl(req, news.image),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data news" });
  }
};

export const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await News.findOne({
      where: { slug }
    });

    if (!news) {
      return res.status(404).json({ message: "News tidak ditemukan" });
    }

    res.json({
      ...news.toJSON(),
      image: getFullImageUrl(req, news.image),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data news" });
  }
};


// ===================================
// CREATE NEWS
// ===================================
export const createNews = async (req, res) => {
  try {
    const { title, desc, tanggalUpload } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/news/${req.file.filename}`;
    }

    const slug = generateSlug(title) + "-" + Date.now();

    const newNews = await News.create({
      title,
      slug, // ✅ tambah ini
      desc,
      image: imagePath,
      tanggalUpload,
    });

    res.status(201).json({
      ...newNews.toJSON(),
      image: getFullImageUrl(req, imagePath),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat news" });
  }
};


// ===================================
// UPDATE NEWS
// ===================================
export const updateNews = async (req, res) => {
  try {
    const { idNews } = req.params;
    const { title, desc, tanggalUpload } = req.body;

    const news = await News.findByPk(idNews);
    if (!news) {
      return res.status(404).json({ message: "News tidak ditemukan" });
    }

    // Jika ada gambar baru → hapus gambar lama
    if (req.file) {
      if (news.image) {
        const oldPath = path.join("public", news.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      news.image = `/uploads/news/${req.file.filename}`;
    }

    if (news.title !== title) {
      news.slug = generateSlug(title) + "-" + Date.now();
    }
    news.title = title;
    news.desc = desc;
    news.tanggalUpload = tanggalUpload;

    await news.save();

    res.json({
      ...news.toJSON(),
      image: getFullImageUrl(req, news.image),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui news" });
  }
};

// ===================================
// DELETE NEWS
// ===================================
export const deleteNews = async (req, res) => {
  try {
    const { idNews } = req.params;
    const news = await News.findByPk(idNews);

    if (!news) {
      return res.status(404).json({ message: "News tidak ditemukan" });
    }

    if (news.image) {
      const filePath = path.join(
        process.cwd(),
        news.image.replace(/^\/+/, "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await news.destroy();
    res.json({ message: "News berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus news" });
  }
};
