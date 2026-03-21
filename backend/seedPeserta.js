// 1. TAMBAHKAN INI DI BARIS PALING ATAS
import 'dotenv/config'; 

// 2. Baru import model dan koneksi
import { Peserta } from "./models/PesertaModel.js"; 
import { sequelize } from "./config/Database.js"; 

const seedPeserta = async () => {
  try {
    // Cek apakah env terbaca
    console.log("Mencoba koneksi ke database:", process.env.DB_NAME);
    
    await sequelize.authenticate();
    console.log("✅ Koneksi Berhasil!");

     const tahunLahir = 2012; 

    const namaIndonesia = [
      "Budi Santoso", "Siti Aminah", "Agus Setiawan", "Dewi Lestari", "Rian Hidayat",
      "Putu Gede", "Made Rai", "Nyoman Wahyu", "Ketut Laras", "Anak Agung Oka",
      "Gede Bagus", "Luh Putu", "Eka Pratama", "Dwi Cahyono", "Tri Utami",
      "Ahmad Fauzi", "Siska Amelia", "Robby Sugara", "Indah Permata", "Hendra Wijaya",
      "Gusti Ngurah", "Ida Bagus", "Ni Wayan", "Komang Aris", "Kadek Bayu",
      "Surya Saputra", "Doni Kusuma", "Maya Indah", "Rina Marlina", "Taufik Hidayat",
      "Andi Wijaya", "Lestari Rahayu", "Bambang Pamungkas", "Joko Widodo", "Gibran Rakabuming",
      "Megawati Soekarno", "Prabowo Subianto", "Anies Baswedan", "Ganjar Pranowo", "Sandiaga Uno",
      "Ridwan Kamil", "Khofifah Indar", "Tri Risma", "Basuki Hadimuljono", "Retno Marsudi",
      "Erick Thohir", "Sri Mulyani", "Bahlil Lahadalia", "Nadiem Makarim", "Luhut Panjaitan",
      "Susi Pudjiastuti", "Mahfud MD", "Muhaimin Iskandar", "Yeni Wahid", "Najwa Shihab",
      "Deddy Corbuzier", "Raffi Ahmad", "Nagita Slavina", "Atta Halilintar", "Baim Wong"
    ];

    const dataPeserta = [];
    for (let i = 0; i < 60; i++) {
      const nama = namaIndonesia[i] || `Peserta Random ${i + 1}`;
      const randomWA = "0812" + Math.floor(10000000 + Math.random() * 90000000);
      
      dataPeserta.push({
        namaLengkap: nama,
        nomorWhatsapp: randomWA,
        tanggalLahir: `${tahunLahir}-05-20`, 
        kelompokUmurId: 1, 
        tournamentId: 2,   
        fotoKartu: "dummy-ktp.jpg",
        buktiBayar: "dummy-bukti.jpg",
        status: "verified",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log("⏳ Memasukkan 60 data peserta...");
    await Peserta.bulkCreate(dataPeserta);
    console.log("🚀 Selesai! 60 data berhasil masuk.");

  } catch (error) {
    console.error("❌ Gagal jalankan seed:", error.message);
  } finally {
    process.exit();
  }
};

seedPeserta();