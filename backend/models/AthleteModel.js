import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Athlete = sequelize.define(
  "Athlete",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },

    // 🔥 GANTI category STRING jadi FK
    kelompokUmurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "kelompok_umur",
        key: "id",
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    club: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "athletes",
    timestamps: true,
  }
);
