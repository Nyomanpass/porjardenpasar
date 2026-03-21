import { Tournament } from "../models/TournamentModel.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// === Konfigurasi Upload Poster ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/tournament";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadPoster = multer({ storage });

// ✅ Get all tournaments
export const getTournaments = async (req, res) => {
  try {
    const where = {};

    if (req.query.level) {
      where.level = req.query.level;
    }

    const data = await Tournament.findAll({ where });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ✅ Get one tournament by ID
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create tournament (dengan upload poster)
export const createTournament = async (req, res) => {
  try {
    const {
      name,
      start_date,
      end_date,
      location,
      description,
      status,
      type,
      level,        // ✅ AMBIL LEVEL
      nominal,
      bank_info,
      requireSchool
    } = req.body;

    console.log("LEVEL DITERIMA:", level); // debug

    const poster = req.file ? req.file.path : null;

    const newTournament = await Tournament.create({
      name,
      start_date,
      end_date,
      location,
      description,
      status,
      poster,
      type: type || "gratis",
      level: level || "local",   // ✅ SIMPAN LEVEL
      nominal: nominal || 0,
      bank_info: bank_info || null,
      requireSchool: requireSchool === "true" || requireSchool === true  
    });

    res.status(201).json(newTournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Update tournament (update data + poster baru jika diupload)
export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });

    const {
      name,
      start_date,
      end_date,
      location,
      description,
      status,
      type,
      level,      // ✅ AMBIL LEVEL
      nominal,
      bank_info,
      requireSchool
    } = req.body;

    if (req.file) {
      if (tournament.poster && fs.existsSync(tournament.poster)) {
        fs.unlinkSync(tournament.poster);
      }
      tournament.poster = req.file.path;
    }

    await tournament.update({
      name: name || tournament.name,
      start_date: start_date || tournament.start_date,
      end_date: end_date || tournament.end_date,
      location: location || tournament.location,
      description: description || tournament.description,
      status: status || tournament.status,
      poster: tournament.poster,
      type: type || tournament.type,
      level: level || tournament.level,   // ✅ UPDATE LEVEL
      nominal: (nominal !== undefined) ? nominal : tournament.nominal,
      bank_info: (bank_info !== undefined) ? bank_info : tournament.bank_info,
      requireSchool: requireSchool !== undefined
      ? (requireSchool === "true" || requireSchool === true)
      : tournament.requireSchool
    });

    res.status(200).json({ message: "Tournament updated", data: tournament });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Delete tournament
export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });

    // hapus poster jika ada
    if (tournament.poster && fs.existsSync(tournament.poster)) {
      fs.unlinkSync(tournament.poster);
    }

    await tournament.destroy();
    res.status(200).json({ message: "Tournament deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
