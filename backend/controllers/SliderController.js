import { Slider } from "../models/SliderModel.js";
import path from "path";
import fs from "fs";

// Helper gambar untuk frontend
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

// ===================================
// GET ALL SLIDER (ACTIVE)
// ===================================
export const getAllSlider = async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      where: { isActive: true },
      order: [["urutan", "ASC"]],
    });

    const result = sliders.map((s) => ({
      ...s.toJSON(),
      image: getFullImageUrl(req, s.image),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ===================================
// GET SLIDER BY ID
// ===================================
export const getSliderById = async (req, res) => {
  try {
    const { idSlider } = req.params;
    const slider = await Slider.findByPk(idSlider);

    if (!slider) {
      return res.status(404).json({ message: "Slider tidak ditemukan" });
    }

    res.json({
      ...slider.toJSON(),
      image: getFullImageUrl(req, slider.image),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data slider" });
  }
};

// ===================================
// CREATE SLIDER
// ===================================
export const createSlider = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      ctaText,
      ctaLink,
      urutan,
      isActive,
    } = req.body;

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/slider/${req.file.filename}`;
    }

    const newSlider = await Slider.create({
      title,
      subtitle,
      description,
      ctaText,
      ctaLink,
      image: imagePath,
      urutan,
      isActive,
    });

    res.status(201).json({
      ...newSlider.toJSON(),
      image: getFullImageUrl(req, imagePath),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat slider" });
  }
};

// ===================================
// UPDATE SLIDER
// ===================================
export const updateSlider = async (req, res) => {
  try {
    const { idSlider } = req.params;
    const {
      title,
      subtitle,
      description,
      ctaText,
      ctaLink,
      urutan,
      isActive,
    } = req.body;

    const slider = await Slider.findByPk(idSlider);
    if (!slider) {
      return res.status(404).json({ message: "Slider tidak ditemukan" });
    }

    // Jika upload gambar baru → hapus lama
    if (req.file) {
      if (slider.image) {
        const oldPath = path.join("public", slider.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      slider.image = `/uploads/slider/${req.file.filename}`;
    }

    slider.title = title;
    slider.subtitle = subtitle;
    slider.description = description;
    slider.ctaText = ctaText;
    slider.ctaLink = ctaLink;
    slider.urutan = urutan;
    slider.isActive = isActive;

    await slider.save();

    res.json({
      ...slider.toJSON(),
      image: getFullImageUrl(req, slider.image),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui slider" });
  }
};

// ===================================
// DELETE SLIDER
// ===================================
export const deleteSlider = async (req, res) => {
  try {
    const { idSlider } = req.params;
    const slider = await Slider.findByPk(idSlider);

    if (!slider) {
      return res.status(404).json({ message: "Slider tidak ditemukan" });
    }

    if (slider.image) {
      const filePath = path.join(
        process.cwd(),
        slider.image.replace(/^\/+/, "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await slider.destroy();
    res.json({ message: "Slider berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus slider" });
  }
};
