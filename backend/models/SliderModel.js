import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Slider = sequelize.define(
  "Slider",
  {
    idSlider: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ctaText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ctaLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    urutan: { type: DataTypes.INTEGER, allowNull: false }, 
  },
  {
    tableName: "Sliders",
    timestamps: true,
  }
);
