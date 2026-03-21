import 'dotenv/config';
import bcrypt from "bcrypt";
import { sequelize } from "./config/Database.js";

import { KelompokUmur } from "./models/KelompokUmurModel.js";
import { Lapangan } from "./models/LapanganModel.js";
import { User } from "./models/UserModel.js";
import { Tournament } from "./models/TournamentModel.js";
import { ScoreRule } from './models/ScoreRuleModel.js';

const seedAll = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi DB berhasil");

    // ======================
    // KELOMPOK UMUR
    // ======================
    await KelompokUmur.bulkCreate([
      { nama: "KU 10 PA", umur: 10 },
      { nama: "KU 10 PI", umur: 10 },
      { nama: "KU 12 PA", umur: 12 },
      { nama: "KU 12 PI", umur: 12 },
      { nama: "KU 14 PA", umur: 14 },
      { nama: "KU 14 PI", umur: 14 },
      { nama: "KU 16 PA", umur: 16 },
      { nama: "KU 16 PI", umur: 16 },
      { nama: "KU Open PA", umur: 40 },
      { nama: "KU Open PI", umur: 40 },
    ], { ignoreDuplicates: true });

    // ======================
    // LAPANGAN
    // ======================
    await Lapangan.bulkCreate([
      { nama: "Lapangan 1", lokasi: "Outdoor sebelah kiri" },
      { nama: "Lapangan 2", lokasi: "Outdoor sebelah kanan" },
      { nama: "Lapangan 3", lokasi: "Indoor gedung A" },
      { nama: "Lapangan 4", lokasi: "Indoor gedung B" },
    ], { ignoreDuplicates: true });

    // ======================
    // USER (ADMIN & WASIT)
    // ======================
    const adminPass = await bcrypt.hash("Passtika@123", 10);
    const wasitPass = await bcrypt.hash("Wasit@123", 10);

    await User.bulkCreate([
      {
        name: "Admin Passtika",
        email: "passtika@gmail.com",
        password: adminPass,
        role: "admin",
        status: "verified",
      },
      {
        name: "Wasit Utama",
        email: "wasit@gmail.com",
        password: wasitPass,
        role: "wasit",
        status: "verified",
      },
    ], { ignoreDuplicates: true });

    // ======================
    // TOURNAMENT
    // ======================
    await Tournament.bulkCreate([
      {
        name: "wali kota cup 2025",
        start_date: "2026-02-28",
        end_date: "2026-03-01",
        location: "Lapangan Kompyang Sujana",
        description: "tournament wali kota cup 2025",
        status: "aktif",
        poster: "uploads/tournament/1769661517885.jpeg",
        type: "gratis",
        level: "local",
        nominal: 0,
        bank_info: null,
      }
    ], { ignoreDuplicates: true });

    // ======================
    // SCORE RULES
    // ======================
    await ScoreRule.bulkCreate([
      {
        name: "BO 3 Super Tiebreak",
        jumlahSet: 3,
        gamePerSet: 6,
        useDeuce: true,
        tieBreakPoint: 7,
        finalTieBreakPoint: 10,
      },
      {
        name: "Pro Set",
        jumlahSet: 1,
        gamePerSet: 8,
        useDeuce: false,
        tieBreakPoint: 7,
        finalTieBreakPoint: 7,
      }
    ], { ignoreDuplicates: true });

    console.log("🎉 SEMUA DATA BERHASIL DI-SEED!");
  } catch (err) {
    console.error("❌ Gagal seed:", err.message);
  } finally {
    process.exit();
  }
};

seedAll();
