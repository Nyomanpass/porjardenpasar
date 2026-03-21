// models/PesertaModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";


export const Peserta = sequelize.define("Peserta", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  namaLengkap: { type: DataTypes.STRING(100), allowNull: false },
  nomorWhatsapp: { type: DataTypes.STRING(20), allowNull: false },
  tanggalLahir: { type: DataTypes.DATEONLY, allowNull: false },
  kelompokUmurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  tournamentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  asalSekolah: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  fotoKartu: { type: DataTypes.STRING, allowNull: true },
  buktiBayar: { 
  type: DataTypes.STRING, 
  allowNull: true 
},
  status: { 
    type: DataTypes.ENUM("pending", "verified", "rejected"),
    allowNull: false,
    defaultValue: "pending"
  },
  isSeeded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

}, {
  tableName: "peserta",
  timestamps: true,
});


