import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Tournament } from "./TournamentModel.js";

export const Jadwal = sequelize.define("Jadwal", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  tournamentId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lapanganId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  waktuMulai: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  waktuSelesai: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("aktif", "selesai", "berlangsung", "dibatalkan"),
    defaultValue: "aktif",
    allowNull: false,
  },
}, {
  tableName: "jadwals",
  timestamps: true,
});
