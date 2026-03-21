import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false }, // Hapus unique: true di sini
  password: { type: DataTypes.STRING(200), allowNull: false },
  role: { 
    type: DataTypes.ENUM("admin", "wasit", "panitia"), 
    allowNull: false, 
    defaultValue: "wasit" 
  },
  status: { 
  type: DataTypes.ENUM("pending", "verified", "rejected"), 
  allowNull: false, 
  defaultValue: "pending" 
}
}, {
  tableName: "users",
  timestamps: true
});
