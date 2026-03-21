// JadwalController.js

import { Jadwal } from '../models/JadwalModel.js';
import { Match } from '../models/MatchModel.js';
import { Peserta } from '../models/PesertaModel.js';
import { Lapangan } from '../models/LapanganModel.js';
import { Bagan } from '../models/BaganModel.js';
import { Op } from 'sequelize'; // Import operator Sequelize
import { DoubleTeam } from '../models/DoubleTeamModel.js';
import { MatchScoreLog } from '../models/MatchScoreLog.js';


export const getJadwal = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    const whereCondition = {};
    if (tournamentId) {
      whereCondition.tournamentId = tournamentId;
    }

    const jadwal = await Jadwal.findAll({
      where: whereCondition,
      include: [
        { 
          model: Match, 
          as: 'match',
          include: [
            // Include untuk Single
            { model: Peserta, as: 'peserta1', attributes: ['id', 'namaLengkap'] },
            { model: Peserta, as: 'peserta2', attributes: ['id', 'namaLengkap'] },
            // TAMBAHKAN INI UNTUK GANDA
            { model: DoubleTeam, as: 'doubleTeam1', attributes: ['id', 'namaTim'] },
            { model: DoubleTeam, as: 'doubleTeam2', attributes: ['id', 'namaTim'] },
            { 
              model: Bagan,
              as: 'bagan',
              attributes: ['id', 'nama'] 
            }
          ]
        },
        { 
          model: Lapangan, 
          as: 'lapangan',
          attributes: ['id', 'nama'] 
        },
      ],
      order: [
        ['tanggal', 'ASC'],
        ['waktuMulai', 'ASC']
      ]
    });

    res.status(200).json(jadwal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getJadwalByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.params;
    const jadwal = await Jadwal.findAll({
      where: { tanggal },
      include: [
        {
          model: Match,
          as: "match",
          include: [
            { model: Peserta, as: "peserta1", attributes: ['id', 'namaLengkap'] },
            { model: Peserta, as: "peserta2", attributes: ['id', 'namaLengkap'] },
            // TAMBAHKAN INI UNTUK GANDA
            { model: DoubleTeam, as: 'doubleTeam1', attributes: ['id', 'namaTim'] },
            { model: DoubleTeam, as: 'doubleTeam2', attributes: ['id', 'namaTim'] },
          ]
        },
        {
          model: Lapangan,
          as: "lapangan"
        }
      ],
      order: [["waktuMulai", "ASC"]],
    });
    res.json(jadwal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil jadwal per tanggal." });
  }
};

// --- Fungsi createJadwal yang Ditingkatkan ---
export const createJadwal = async (req, res) => {
  try {
    const { matchId, lapanganId, waktuMulai, tanggal, tournamentId} = req.body;

    // Hitung waktuSelesai secara otomatis (durasi 1 jam)
    const waktuMulaiDate = new Date(waktuMulai);
    const waktuSelesaiDate = new Date(waktuMulaiDate.getTime() + 60 * 60 * 1000); // Tambah 1 jam (60 menit * 60 detik * 1000 milidetik)

    // 1. Validasi Match: Cek apakah matchId valid dan statusnya bisa dijadwalkan
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match tidak ditemukan" });
    }
    // Hanya izinkan match dengan status "belum"
    if (match.status !== "belum") {
      return res.status(400).json({ error: "Match ini sudah memiliki jadwal atau tidak valid untuk dijadwalkan." });
    }

    // 2. Validasi Duplikasi Match: Pastikan match belum punya jadwal lain
    const existingJadwalForMatch = await Jadwal.findOne({
      where: {
        matchId: matchId,
        status: { [Op.ne]: 'selesai' } // status bukan 'selesai'
      }
    });
    if (existingJadwalForMatch) {
      return res.status(400).json({ error: "Match ini sudah dijadwalkan." });
    }

    // 3. Validasi Ketersediaan Lapangan (Logika yang diperbarui)
      const overlappingJadwal = await Jadwal.findOne({
        where: {
          lapanganId,
          tanggal,
          tournamentId, // ← tambahkan ini supaya bentrok hanya dicek dalam tournament yang sama
          [Op.and]: [
            { waktuMulai: { [Op.lt]: waktuSelesaiDate.toISOString() } },
            { waktuSelesai: { [Op.gt]: waktuMulaiDate.toISOString() } },
          ]
        }
      });

    if (overlappingJadwal) {
      return res.status(400).json({ error: "Lapangan sudah terpakai pada waktu yang Anda pilih." });
    }

    // 4. Buat dan simpan jadwal baru
    const newJadwal = await Jadwal.create({
      matchId,
      lapanganId,
      waktuMulai: waktuMulaiDate,
      waktuSelesai: waktuSelesaiDate,
      tanggal,
      tournamentId, 
      status: "aktif"
    });

    res.status(201).json(newJadwal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const updateStatusJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) return res.status(404).json({ error: "Jadwal tidak ditemukan" });

    // Update status jadwal
    jadwal.status = status;
    await jadwal.save();

    // Kalau jadwal selesai, update juga status match
    if (status === "selesai") {
      const match = await Match.findByPk(jadwal.matchId);
      if (match) {
        match.status = "selesai";
        await match.save();
      }
    }

    res.json(jadwal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cari jadwal + match-nya
    const jadwal = await Jadwal.findByPk(id, {
      include: [{ model: Match, as: "match" }]
    });

    if (!jadwal) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
    }

    // 2. RESET MATCH ke kondisi awal
    if (jadwal.match) {

      const matchId = jadwal.match.id;

      await MatchScoreLog.destroy({
        where: { matchId }
      });


      await jadwal.match.update({
        status: "belum",
        score1: null,
        score2: null,

        set1P1: 0,
        set1P2: 0,
        set2P1: 0,
        set2P2: 0,
        set3P1: 0,
        set3P2: 0,

        winnerId: null,
        winnerDoubleId: null,
        scoreRuleId: null
      });
    }

    // 3. Hapus jadwal
    await jadwal.destroy();

    res.status(200).json({
      message: "Jadwal dihapus & match berhasil direset."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus jadwal." });
  }
};


export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { matchId, lapanganId, waktuMulai, tanggal } = req.body;

    // ===============================
    // 1. CARI JADWAL
    // ===============================
    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan." });
    }

    const oldMatchId = jadwal.matchId;

    // ===============================
    // 2. CEK KONDISI RESET MATCH
    // ===============================
    const isMatchChanged =
      matchId && Number(matchId) !== Number(oldMatchId);

    const wasRunning =
      jadwal.status === "berlangsung" || jadwal.status === "aktif";

    if (isMatchChanged || wasRunning) {
      const oldMatch = await Match.findByPk(oldMatchId);

      if (oldMatch) {
        // 🧹 HAPUS SCORE LOG
        await MatchScoreLog.destroy({
          where: { matchId: oldMatchId }
        });

        // 🔄 RESET MATCH LAMA
        await oldMatch.update({
          status: "belum",
          score1: null,
          score2: null,
          set1P1: 0,
          set1P2: 0,
          set2P1: 0,
          set2P2: 0,
          set3P1: 0,
          set3P2: 0,
          winnerId: null,
          winnerDoubleId: null,
          scoreRuleId: null
        });
      }

      // VALIDASI MATCH BARU (kalau diganti)
      if (isMatchChanged) {
        const newMatch = await Match.findByPk(matchId);
        if (!newMatch || newMatch.status !== "belum") {
          return res.status(400).json({
            error: "Match baru tidak valid untuk dijadwalkan."
          });
        }
      }
    }

    // ===============================
    // 3. HITUNG WAKTU
    // ===============================
    const updatedTanggal = tanggal || jadwal.tanggal;

    const updatedWaktuMulai = waktuMulai
      ? new Date(waktuMulai)
      : jadwal.waktuMulai;

    const updatedWaktuSelesai = waktuMulai
      ? new Date(updatedWaktuMulai.getTime() + 60 * 60 * 1000)
      : jadwal.waktuSelesai;

    // ===============================
    // 4. CEK BENTROK LAPANGAN
    // ===============================
    const overlappingJadwal = await Jadwal.findOne({
      where: {
        id: { [Op.ne]: id },
        lapanganId: lapanganId || jadwal.lapanganId,
        tanggal: updatedTanggal,
        [Op.and]: [
          { waktuMulai: { [Op.lt]: updatedWaktuSelesai } },
          { waktuSelesai: { [Op.gt]: updatedWaktuMulai } },
        ]
      }
    });

    if (overlappingJadwal) {
      return res.status(400).json({
        error: "Lapangan sudah terpakai pada waktu tersebut."
      });
    }

    // ===============================
    // 5. UPDATE JADWAL
    // ===============================
    await jadwal.update({
      matchId: matchId || jadwal.matchId,
      lapanganId: lapanganId || jadwal.lapanganId,
      tanggal: updatedTanggal,
      waktuMulai: updatedWaktuMulai,
      waktuSelesai: updatedWaktuSelesai,
      status: "aktif"
    });

    res.json({
      message: "Jadwal berhasil diperbarui & match disinkronkan."
    });

  } catch (error) {
    console.error("updateJadwal error:", error);
    res.status(500).json({ error: error.message });
  }
};