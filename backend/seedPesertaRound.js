import 'dotenv/config'; 
import { Peserta } from "./models/PesertaModel.js"; 
import { sequelize } from "./config/Database.js"; 

const seedPesertaRound = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi Berhasil!");

    // List 4 nama wanita Indonesia
    const namaWanita = [
      "Siti Aminah", 
      "Dewi Lestari", 
      "Siska Amelia", 
      "Indah Permata",
      "Rina Suryani"  
    ];

    const dataPeserta = [];
    for (let i = 0; i < 5; i++) {
      const randomWA = "0813" + Math.floor(10000000 + Math.random() * 90000000);
      
      dataPeserta.push({
        namaLengkap: namaWanita[i],
        nomorWhatsapp: randomWA,
        tanggalLahir: "2007-05-20", // Contoh tanggal lahir
        kelompokUmurId: 2,          // Target ID 2
        tournamentId: 1,   
        fotoKartu: "wanita-ktp.jpg",
        buktiBayar: "wanita-bukti.jpg",
        status: "verified",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log("⏳ Memasukkan 4 data peserta...");
    await Peserta.bulkCreate(dataPeserta);
    console.log("🚀 Selesai! 4 data wanita berhasil masuk ke Kelompok Umur 2.");

  } catch (error) {
    console.error("❌ Gagal jalankan seed:", error.message);
  } finally {
    process.exit();
  }
};

seedPesertaRound();