import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js"; // ✅ INI YANG KURANG

export const ScoreRule = sequelize.define("ScoreRule", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  name: { type: DataTypes.STRING, allowNull: false },

  jumlahSet: { type: DataTypes.INTEGER, allowNull: false },   // contoh: 3
  gamePerSet: { type: DataTypes.INTEGER, allowNull: false }, // contoh: 6

  useDeuce: { type: DataTypes.BOOLEAN, defaultValue: true },

  tieBreakPoint: { type: DataTypes.INTEGER, allowNull: true },      // contoh: 7
  finalTieBreakPoint: { type: DataTypes.INTEGER, allowNull: true }, // contoh: 10
}, {
  tableName: "score_rules"
});
