import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { KelompokUmur } from "./KelompokUmurModel.js";
import { Tournament } from "./TournamentModel.js";


export const Bagan = sequelize.define("Bagan", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING, allowNull: false },
  tipe: { type: DataTypes.ENUM("roundrobin", "knockout"), allowNull: false },
  jumlahPeserta: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("draft", "aktif", "selesai"), defaultValue: "draft" },
  // Perbaiki bagian ini:
  isLocked: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  kategori: { 
    type: DataTypes.ENUM("single", "double"), 
    defaultValue: "single" 
  },
  tournamentId: { // Pastikan kolom FK ini ada di define jika ingin manual
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kelompokUmurId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "bagans", // Paksa nama table agar konsisten
  timestamps: true
});

KelompokUmur.hasOne(Bagan, { foreignKey: "kelompokUmurId" });
Bagan.belongsTo(KelompokUmur, { foreignKey: "kelompokUmurId" });

Tournament.hasMany(Bagan, { foreignKey: "tournamentId", onDelete: "CASCADE" });
Bagan.belongsTo(Tournament, { foreignKey: "tournamentId" });