// models/TournamentModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Tournament = sequelize.define("Tournament", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  location: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("aktif", "nonaktif"),
    defaultValue: "nonaktif",
  },
  poster: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },

  // --- TAMBAHKAN KOLOM DI BAWAH INI ---

  // 1. Tipe Turnamen (Gratis atau Berbayar)
  type: {
    type: DataTypes.ENUM("gratis", "berbayar"),
    defaultValue: "gratis",
    allowNull: false
  },

  requireSchool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  level: {
    type: DataTypes.ENUM("local", "nasional", "internasional"),
    defaultValue: "local",
    allowNull: false
  },

  // 2. Nominal Biaya Pendaftaran (Gunakan INTEGER untuk angka saja)
  nominal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },

  // 3. Informasi Bank (Contoh: "BCA - 12345678 a/n PELTI")
  bank_info: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "tournaments",
  timestamps: true,
});