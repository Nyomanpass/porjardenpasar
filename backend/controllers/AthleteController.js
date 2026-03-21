import { Athlete } from "../models/AthleteModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import fs from "fs";
import path from "path";

// Helper foto untuk frontend
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

// ======================
// GET ALL ATHLETES
// ======================
export const getAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.findAll({
      include: [
        {
          model: KelompokUmur,
          as: "kelompokUmur",
          attributes: ["id", "nama"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const result = athletes.map((a) => ({
      ...a.toJSON(),
      photo: getFullImageUrl(req, a.photo),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ======================
// GET ATHLETE BY ID
// ======================
export const getAthleteById = async (req, res) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id, {
      include: [
        {
          model: KelompokUmur,
          as: "kelompokUmur",
          attributes: ["id", "nama"],
        },
      ],
    });


    if (!athlete) {
      return res.status(404).json({ message: "Athlete tidak ditemukan" });
    }

    res.json({
      ...athlete.toJSON(),
      photo: getFullImageUrl(req, athlete.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ======================
// CREATE ATHLETE
// ======================
export const createAthlete = async (req, res) => {
  try {
    const {
      name,
      birthDate,
      gender,
      kelompokUmurId,
      phoneNumber,
      address,
      club
    } = req.body;

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/athlete/${req.file.filename}`;
    }

    const newAthlete = await Athlete.create({
      name,
      birthDate,
      gender,
      kelompokUmurId,
      phoneNumber,
      address,
      club,
      photo: photoPath,
    });

    res.status(201).json({
      ...newAthlete.toJSON(),
      photo: getFullImageUrl(req, newAthlete.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat atlet" });
  }
};

// ======================
// UPDATE ATHLETE
// ======================
export const updateAthlete = async (req, res) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id);

    if (!athlete) {
      return res.status(404).json({ message: "Athlete tidak ditemukan" });
    }

    const {
      name,
      birthDate,
      gender,
      kelompokUmurId,
      phoneNumber,
      address,
      club
    } = req.body;

    // Jika upload foto baru → hapus lama
    if (req.file) {
      if (athlete.photo) {
        const oldPath = path.join(process.cwd(), athlete.photo.replace(/^\/+/, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      athlete.photo = `/uploads/athlete/${req.file.filename}`;
    }

    athlete.name = name;
    athlete.birthDate = birthDate;
    athlete.gender = gender;
    athlete.kelompokUmurId = kelompokUmurId;
    athlete.phoneNumber = phoneNumber;
    athlete.address = address;
    athlete.club = club;

    await athlete.save();

    res.json({
      ...athlete.toJSON(),
      photo: getFullImageUrl(req, athlete.photo),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate atlet" });
  }
};

// ======================
// DELETE ATHLETE
// ======================
export const deleteAthlete = async (req, res) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id);

    if (!athlete) {
      return res.status(404).json({ message: "Athlete tidak ditemukan" });
    }

    if (athlete.photo) {
      const filePath = path.join(process.cwd(), athlete.photo.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await athlete.destroy();
    res.json({ message: "Athlete berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus atlet" });
  }
};
