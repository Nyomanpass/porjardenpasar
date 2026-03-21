// 1. TAMBAHKAN INI DI BARIS PALING ATAS
import 'dotenv/config'; 

// 2. Import model dan koneksi
import { Peserta } from "./models/PesertaModel.js"; 
import { sequelize } from "./config/Database.js"; 

const seedPesertaSpesifik = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi Berhasil!");

    const namaPeserta = [
      "Andi Pratama", 
      "Budi Cahyono", 
      "Siti Aminah", 
      "Rizky Ramadhan", 
      "Dewi Sartika", 
      "Fajar Hidayat"
    ];

    const dataPeserta = [];
    
    // Tahun sekarang 2026, agar umur 14 tahun maka lahir tahun 2012
    const tahunLahir = 2012; 

    for (let i = 0; i < 6; i++) {
      const randomWA = "0812" + Math.floor(10000000 + Math.random() * 90000000);
      
      dataPeserta.push({
        namaLengkap: namaPeserta[i],
        nomorWhatsapp: randomWA,
        // Tanggal lahir disetel ke tahun 2012 agar tepat 14 tahun di 2026
        tanggalLahir: `${tahunLahir}-05-20`, 
        kelompokUmurId: 1, // Sesuai permintaan Anda
        tournamentId: 1,  // Sesuai permintaan Anda
        fotoKartu: "dummy-ktp.jpg",
        buktiBayar: "dummy-bukti.jpg",
        status: "verified",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log("⏳ Memasukkan 6 data peserta (Umur 14 Tahun)...");
    await Peserta.bulkCreate(dataPeserta);
    console.log("🚀 Selesai! 6 data berhasil masuk ke Kelompok Umur 3.");

  } catch (error) {
    console.error("❌ Gagal jalankan seed:", error.message);
  } finally {
    process.exit();
  }
};

seedPesertaSpesifik();