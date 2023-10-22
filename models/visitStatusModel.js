import { DataTypes } from "sequelize";
import db from "../config/database.js";

const visitStatusModel = db.define(
  "visitStatusModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    statusName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "VisitStatus",
    timestamps: true,
  }
);

export default visitStatusModel;
