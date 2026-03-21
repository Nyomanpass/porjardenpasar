// controllers/LapanganController.js
import { Lapangan } from "../models/LapanganModel.js";

// Create Lapangan
export const createLapangan = async (req, res) => {
  try {
    const { nama, lokasi } = req.body;
    const lapangan = await Lapangan.create({ nama, lokasi });
    res.status(201).json(lapangan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Lapangan
export const getLapangan = async (req, res) => {
  try {
    const lapangan = await Lapangan.findAll();
    res.status(200).json(lapangan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Lapangan by ID
export const getLapanganById = async (req, res) => {
  try {
    const lapangan = await Lapangan.findByPk(req.params.id);
    if (!lapangan) return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    res.status(200).json(lapangan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Lapangan
export const updateLapangan = async (req, res) => {
  try {
    const { nama, lokasi } = req.body;
    const lapangan = await Lapangan.findByPk(req.params.id);
    if (!lapangan) return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    lapangan.nama = nama;
    lapangan.lokasi = lokasi;
    await lapangan.save();

    res.status(200).json(lapangan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Lapangan
export const deleteLapangan = async (req, res) => {
  try {
    const lapangan = await Lapangan.findByPk(req.params.id);
    if (!lapangan) return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    await lapangan.destroy();
    res.status(200).json({ message: "Lapangan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
