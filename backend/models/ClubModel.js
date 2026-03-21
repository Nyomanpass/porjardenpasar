import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Club = sequelize.define(
  "Club",
  {
    idClub: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    leaderName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
  },
  {
    tableName: "clubs",
    timestamps: true,
    }
);
