import { Club } from "../models/ClubModel.js";
import fs from "fs";
import path from "path";

// Helper foto untuk frontend
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

// ======================
// GET ALL CLUBS
// ======================
export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.findAll({ order: [["idClub", "ASC"]] });

    const result = clubs.map((c) => ({
      ...c.toJSON(),
      photo: getFullImageUrl(req, c.photo),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ======================
// GET CLUB BY ID
// ======================
export const getClubById = async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club tidak ditemukan" });
    }

    res.json({
      ...club.toJSON(),
      photo: getFullImageUrl(req, club.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ======================
// CREATE CLUB
// ======================
export const createClub = async (req, res) => {
  try {
    const { name, address, phone, leaderName } = req.body;
    let photoPath = null;

    if (req.file) {
      photoPath = `/uploads/club/${req.file.filename}`;
    }

    const newClub = await Club.create({
      name,
      address,
      phone,
      leaderName,
      photo: photoPath,
    });

    res.status(201).json({
      ...newClub.toJSON(),
      photo: getFullImageUrl(req, newClub.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat club" });
  }
};

// ======================
// UPDATE CLUB
// ======================
export const updateClub = async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club tidak ditemukan" });
    }

    const { name, address, phone, leaderName } = req.body;

    // Jika upload foto baru → hapus lama
    if (req.file) {
      if (club.photo) {
        const oldPath = path.join(process.cwd(), club.photo.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      club.photo = `/uploads/club/${req.file.filename}`;
    }

    club.name = name;
    club.address = address;
    club.phone = phone;
    club.leaderName = leaderName;

    await club.save();

    res.json({
      ...club.toJSON(),
      photo: getFullImageUrl(req, club.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate club" });
  }
};

// ======================
// DELETE CLUB
// ======================
export const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club tidak ditemukan" });
    }

    if (club.photo) {
      const filePath = path.join(process.cwd(), club.photo.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await club.destroy();
    res.json({ message: "Club berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus club" });
  }
};
