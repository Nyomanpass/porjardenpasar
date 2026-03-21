import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Match } from "./MatchModel.js";

export const MatchScoreLog = sequelize.define("MatchScoreLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  setKe: {
    type: DataTypes.INTEGER, // Set 1, Set 2, atau Set 3
    allowNull: false,
  },
  skorP1: {
    type: DataTypes.STRING, // "0", "15", "30", "40", "Ad"
    allowNull: false,
  },
  skorP2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gameP1: {
    type: DataTypes.INTEGER, // Skor Game saat itu (misal 5-4)
    allowNull: false,
  },
  gameP2: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  keterangan: {
    type: DataTypes.STRING, // Contoh: "Point for Player 1", "Ace", "Deuce"
    allowNull: true,
  },
  setMenangP1: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Sudah menang berapa set (0, 1, atau 2)
  },
  setMenangP2: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "match_score_logs",
  timestamps: true, // Ini penting untuk mengurutkan history berdasarkan waktu
});

// Relasi
Match.hasMany(MatchScoreLog, { foreignKey: "matchId", onDelete: "CASCADE" });
MatchScoreLog.belongsTo(Match, { foreignKey: "matchId" });