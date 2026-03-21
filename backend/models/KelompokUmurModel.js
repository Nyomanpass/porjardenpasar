// models/KelompokUmurModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const KelompokUmur = sequelize.define("KelompokUmur", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING(50), allowNull: false },
  umur: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: "kelompok_umur",
  timestamps: false,
});
