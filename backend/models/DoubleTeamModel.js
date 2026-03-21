// models/DoubleTeamModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Peserta } from "./PesertaModel.js";
import { Tournament } from "./TournamentModel.js";
import { KelompokUmur } from "./KelompokUmurModel.js";

export const DoubleTeam = sequelize.define("DoubleTeam", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  player1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "peserta", key: "id" }
  },
  player2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "peserta", key: "id" }
  },
  tournamentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "tournaments", key: "id" }
  },
  kelompokUmurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "kelompok_umur", key: "id" },
  },
  namaTim: { type: DataTypes.STRING, allowNull: true },
  status: { 
    type: DataTypes.ENUM("pending", "verified", "rejected"),
    allowNull: false,
    defaultValue: "verified" 
  },
  isSeeded: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: "double_teams",
  timestamps: true,
});

// Relasi
DoubleTeam.belongsTo(Peserta, { as: 'Player1', foreignKey: 'player1Id' });
DoubleTeam.belongsTo(Peserta, { as: 'Player2', foreignKey: 'player2Id' });
DoubleTeam.belongsTo(Tournament, { foreignKey: 'tournamentId' });
DoubleTeam.belongsTo(KelompokUmur, { foreignKey: 'kelompokUmurId' });