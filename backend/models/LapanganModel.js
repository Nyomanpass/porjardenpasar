import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Lapangan = sequelize.define("Lapangan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false, // contoh: "Lapangan 1"
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: false, // contoh: "Outdoor sebelah kiri"
  }
}, {
  tableName: "lapangans",
  timestamps: true,
});
