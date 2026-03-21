// controllers/KelompokUmurController.js
import { KelompokUmur } from "../models/KelompokUmurModel.js";

// ✅ Get all kelompok umur
export const getKelompokUmur = async (req, res) => {
  try {
    const data = await KelompokUmur.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get kelompok umur by ID
export const getKelompokUmurById = async (req, res) => {
  try {
    const data = await KelompokUmur.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create kelompok umur
export const createKelompokUmur = async (req, res) => {
  try {
    const { nama, umur } = req.body; // Ambil 'umur' dari body
    const newData = await KelompokUmur.create({ 
        nama, 
        umur: parseInt(umur) || 0 // Pastikan angka
    });
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update kelompok umur
export const updateKelompokUmur = async (req, res) => {
  try {
    const { nama, umur } = req.body;
    const data = await KelompokUmur.findByPk(req.params.id);

    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    data.nama = nama;
    data.umur = parseInt(umur) || 0;
    await data.save();

    res.json({ message: "Data berhasil diupdate", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete kelompok umur
export const deleteKelompokUmur = async (req, res) => {
  try {
    const data = await KelompokUmur.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });

    await data.destroy();
    res.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
