import { DataTypes } from "sequelize";
import db from "../config/database.js";

const serviceModel = db.define(
  "serviceModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "Service",
    timestamps: true,
  }
);

export default serviceModel;
