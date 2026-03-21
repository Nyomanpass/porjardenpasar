import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Bagan } from "./BaganModel.js";
import { Peserta } from "./PesertaModel.js";
import { Tournament } from "./TournamentModel.js";
import { DoubleTeam } from "./DoubleTeamModel.js"; // <--- Import DoubleTeam



export const Match = sequelize.define("Match", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  round: { type: DataTypes.INTEGER, allowNull: false },
  slot: { type: DataTypes.INTEGER, allowNull: false },
  
  // --- UNTUK SINGLE ---
  peserta1Id: { type: DataTypes.INTEGER, allowNull: true },
  peserta2Id: { type: DataTypes.INTEGER, allowNull: true },
  winnerId: { type: DataTypes.INTEGER, allowNull: true },

  // --- UNTUK DOUBLE (Tambahkan Kolom Baru Ini) ---
  doubleTeam1Id: { type: DataTypes.INTEGER, allowNull: true },
  doubleTeam2Id: { type: DataTypes.INTEGER, allowNull: true },
  winnerDoubleId: { type: DataTypes.INTEGER, allowNull: true },
  currentSet: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  score1: { type: DataTypes.INTEGER, allowNull: true },
  score2: { type: DataTypes.INTEGER, allowNull: true },
  set1P1: { type: DataTypes.INTEGER, allowNull: true },
  set1P2: { type: DataTypes.INTEGER, allowNull: true },
  set2P1: { type: DataTypes.INTEGER, allowNull: true },
  set2P2: { type: DataTypes.INTEGER, allowNull: true },
  set3P1: { type: DataTypes.INTEGER, allowNull: true },
  set3P2: { type: DataTypes.INTEGER, allowNull: true },

  nextMatchId: { type: DataTypes.INTEGER, allowNull: true },
  scoreRuleId: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  refereeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  durasi: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
    isTimerRunning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  timerStartedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: { type: DataTypes.ENUM("belum","berlangsung","selesai"), defaultValue: "belum" },
  tournamentId: { type: DataTypes.INTEGER, allowNull: false },
  baganId: { type: DataTypes.INTEGER, allowNull: false },
});

// --- DEFINISI RELASI ---

// Relasi ke Bagan & Tournament
Bagan.hasMany(Match, { foreignKey: "baganId" });
Match.belongsTo(Bagan, { foreignKey: "baganId", as: "bagan" }); 
Match.belongsTo(Tournament, { foreignKey: "tournamentId" });

// Relasi ke Peserta (Sistem Single)
Match.belongsTo(Peserta, { as: "peserta1", foreignKey: "peserta1Id" });
Match.belongsTo(Peserta, { as: "peserta2", foreignKey: "peserta2Id" });
Match.belongsTo(Peserta, { as: "winner", foreignKey: "winnerId" });

// Relasi ke DoubleTeam (Sistem Ganda)
Match.belongsTo(DoubleTeam, { as: "doubleTeam1", foreignKey: "doubleTeam1Id" });
Match.belongsTo(DoubleTeam, { as: "doubleTeam2", foreignKey: "doubleTeam2Id" });
Match.belongsTo(DoubleTeam, { as: "winnerDouble", foreignKey: "winnerDoubleId" });

