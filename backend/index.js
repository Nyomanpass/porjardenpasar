import "dotenv/config";
import multer from "multer";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/Database.js";
import "./models/index.js";
import "./models/UserModel.js";
import './models/KelompokUmurModel.js';
import './models/PesertaModel.js';
import './models/JadwalModel.js'
import "./models/MatchScoreLog.js";
import './models/NewsModel.js';
import './models/SliderModel.js';
import "./models/AthleteModel.js";
import "./models/ClubModel.js";

const PORT = process.env.PORT || 5004;


// autentication
import authRoutes from "./routes/AuthRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";

//kelompok umur
import kelompokUmur from "./routes/KelompokUmurRoutes.js";

//peserta
import pesertaRoutes from "./routes/PesertaRoutes.js";

//bagan
import baganRoutes from './routes/BaganRoutes.js';
import matchRoutes from './routes/MatchRoutes.js';

//jadwal
import jadwalRoutes from './routes/JadwalRoutes.js'
//lapangan
import lapanganRoutes from './routes/LapanganRoutes.js'
//tournament
import tournamentRoutes from './routes/TournamentRoutes.js'
//double team
import doubleRoutes from "./routes/DoubleRoutes.js"; 
//berita
import newsRoutes from "./routes/NewsRoutes.js";
//slider
import sliderRoutes from "./routes/SliderRoutes.js";
//athtlete
import athleteRoutes from "./routes/AthleteRoutes.js";
//club
import clubRoutes from "./routes/ClubRoutes.js";
//wasit
import wasitRoutes from "./routes/WasitRoutes.js";
//aturan skor
import scoreRuleRoutes from "./routes/ScoreRuleRoutes.js";
//panitia
import panitiaRoutes from "./routes/PanitiaRoutes.js";

const app = express();

app.use(cors({
  origin: [
    "https://peltidenpasar.org",
    "https://www.peltidenpasar.org"
  ]
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

//authentication
app.use("/api", authRoutes);
app.use("/api", adminRoutes);


//settings
app.use("/api", kelompokUmur);


//peserta
app.use('/api', pesertaRoutes);
app.use('/api', baganRoutes);
app.use('/api', matchRoutes);

//jadwal
app.use('/api', jadwalRoutes);

//lapangan
app.use('/api', lapanganRoutes);

//tournament
app.use('/api', tournamentRoutes);

//double team
app.use("/api", doubleRoutes);

//import berita 
app.use("/api", newsRoutes);

//import slider
app.use("/api", sliderRoutes);

//import athlete
app.use("/api", athleteRoutes);

//import club
app.use("/api", clubRoutes);

//import wasit
app.use("/api", wasitRoutes);

//import aturan skor
app.use("/api", scoreRuleRoutes);

//import panitia
app.use("/api", panitiaRoutes);


app.use((err, req, res, next) => {
  console.error("UPLOAD ERROR:", err);

  // Jika error karena ukuran file
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Ukuran file maksimal 1.5MB"
      });
    }
    return res.status(400).json({
      message: err.message
    });
  }

  // Jika error dari fileFilter
  if (err) {
    return res.status(400).json({
      message: err.message
    });
  }

  next();
});


app.get("/", (req, res) => res.send("API OK"));

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    console.log(Object.keys(sequelize.models));

    // await sequelize.sync();
    // await sequelize.sync({ force: true });

    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log("Server berjalan di port 5004"));
  } catch (error) {
    console.error("❌ Error saat menjalankan server:", error);
  }
};

start();
