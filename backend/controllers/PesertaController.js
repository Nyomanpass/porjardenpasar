import multer from "multer";
import path from "path";
import fs from "fs";
import { Peserta, KelompokUmur, Tournament } from "../models/index.js";

// ====== Konfigurasi upload file ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan folder umum 'uploads/peserta' agar bisa menampung fotokartu & buktibayar
    const dir = "uploads/peserta";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Tambahkan prefix fieldname agar file tidak tertukar
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});


export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Hanya file JPG, JPEG, dan PNG yang diperbolehkan"), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 1.5 * 1024 * 1024 // 1.5MB
  }
});

// ====== Controller ======

// Get semua peserta by status
export const getPesertaByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await Peserta.findAll({
      where: { status },
      include: { model: KelompokUmur, as: "kelompokUmur", attributes: ["id", "nama"] },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get peserta by ID
export const getPesertaById = async (req, res) => {
  try {
    const data = await Peserta.findByPk(req.params.id, {
      include: [
        { model: KelompokUmur, as: "kelompokUmur", attributes: ["id", "nama"] },
        { model: Tournament, as: "tournament", attributes: ["id", "name"] } // ✅ FIX
      ],
    });
    if (!data) return res.status(404).json({ message: "Peserta tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPeserta = async (req, res) => {
  try {
    const { namaLengkap, nomorWhatsapp, tanggalLahir, kelompokUmurId, tournamentId, asalSekolah  } = req.body;
    
    // Gunakan Optional Chaining ?. untuk keamanan
    const fotoKartu = req.files?.fotoKartu ? req.files.fotoKartu[0].path : null;
    const buktiBayar = req.files?.buktiBayar ? req.files.buktiBayar[0].path : null;

    const newData = await Peserta.create({
      namaLengkap,
      nomorWhatsapp,
      tanggalLahir,
      kelompokUmurId,
      tournamentId,
      asalSekolah: asalSekolah || null,  
      fotoKartu,
      buktiBayar, 
      status: "pending"
    });

    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePeserta = async (req, res) => {
  try {
    // Cari peserta
    const peserta = await Peserta.findByPk(req.params.id);
    if (!peserta) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    const { namaLengkap, nomorWhatsapp, tanggalLahir, kelompokUmurId, tournamentId, status, asalSekolah } = req.body;

    // 1. Logika Update FOTO KARTU (Cek req.files)
    if (req.files?.fotoKartu) {
      if (peserta.fotoKartu && fs.existsSync(peserta.fotoKartu)) {
        fs.unlinkSync(peserta.fotoKartu);
      }
      peserta.fotoKartu = req.files.fotoKartu[0].path;
    }

    // 2. Logika Update BUKTI BAYAR (Cek req.files)
    if (req.files?.buktiBayar) {
      if (peserta.buktiBayar && fs.existsSync(peserta.buktiBayar)) {
        fs.unlinkSync(peserta.buktiBayar);
      }
      peserta.buktiBayar = req.files.buktiBayar[0].path;
    }

    // 3. Update data menggunakan method update() agar lebih bersih
    await peserta.update({
      namaLengkap: namaLengkap || peserta.namaLengkap,
      nomorWhatsapp: nomorWhatsapp || peserta.nomorWhatsapp,
      tanggalLahir: tanggalLahir || peserta.tanggalLahir,
      kelompokUmurId: kelompokUmurId || peserta.kelompokUmurId,
      tournamentId: tournamentId || peserta.tournamentId,
      asalSekolah: asalSekolah ?? peserta.asalSekolah, 
      status: status || peserta.status,
      fotoKartu: peserta.fotoKartu,
      buktiBayar: peserta.buktiBayar
    });

    res.json({ message: "Peserta berhasil diupdate", data: peserta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update deletePeserta untuk menghapus BUKTI BAYAR juga jika ada
export const deletePeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findByPk(req.params.id);
    if (!peserta) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // Hapus Foto Kartu
    if (peserta.fotoKartu && fs.existsSync(peserta.fotoKartu)) {
      fs.unlinkSync(peserta.fotoKartu);
    }
    // Hapus Bukti Bayar (Tambahan)
    if (peserta.buktiBayar && fs.existsSync(peserta.buktiBayar)) {
      fs.unlinkSync(peserta.buktiBayar);
    }

    await peserta.destroy();
    res.json({ message: "Peserta berhasil dihapus beserta file-filenya" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, alasan } = req.body; 

    const peserta = await Peserta.findByPk(id);

    if (!peserta) return res.status(404).json({ msg: "Peserta tidak ditemukan" });

    if (status === "rejected") {
      // Jika ditolak, langsung hapus dari database
      await peserta.destroy();
      return res.status(200).json({ 
        msg: "Peserta berhasil ditolak dan data telah dihapus",
        status: "deleted" 
      });
    }

    // Jika diverifikasi (verified)
    peserta.status = "verified";
    if (alasan) peserta.alasan = alasan; // Opsional jika status verified ingin simpan catatan
    
    await peserta.save();

    res.status(200).json({ 
      msg: "Peserta berhasil diverifikasi", 
      data: peserta 
    });
  } catch (error) {
    console.error("Error verifyPeserta:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get peserta per kelompok umur
export const getPesertaByKelompokUmur = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    const pesertaFilter = { status: "verified" };

    // Kalau tournamentId dikirim dari frontend → tambahkan filter
    if (tournamentId) {
      pesertaFilter.tournamentId = tournamentId;
    }

    const result = await KelompokUmur.findAll({
      attributes: ["id", "nama"],
      include: [
        {
          model: Peserta,
          as: "peserta",
          attributes: ["id", "namaLengkap", "status", "kelompokUmurId", "tournamentId", "asalSekolah", 'nomorWhatsapp', 'tanggalLahir'],
          where: pesertaFilter,
          required: false, // supaya kelompok umur tetap muncul meskipun tidak ada peserta
        },
      ],
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


export const getPesertaFiltered = async (req, res) => {
  try {
    const { kelompokUmurId, status, tournamentId } = req.query; // tambahkan tournamentId
    let whereClause = {};

    if (kelompokUmurId) {
      whereClause.kelompokUmurId = kelompokUmurId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (tournamentId) {
      whereClause.tournamentId = tournamentId; // filter berdasarkan tournament
    }

    const peserta = await Peserta.findAll({
      where: whereClause,
       attributes: [
        "id",
        "namaLengkap",
        "asalSekolah",   
        "status",
        "kelompokUmurId",
        "tournamentId",
        "nomorWhatsapp",
        "tanggalLahir"
      ],
      include: [
        { 
          model: KelompokUmur,
          as: "kelompokUmur"
        } 
      ]
    });

    res.json(peserta);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};




