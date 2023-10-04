import { DataTypes } from "sequelize";
import db from "../config/database.js";

const serviceModel = db.define(
  "serviceModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    service_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    duration_month: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    max_camera: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "service_list",
    timestamps: true,
    underscored: true,
  }
);

export default serviceModel;
