import { DataTypes } from "sequelize";
import db from "../config/database.js";

const visitStatusModel = db.define(
  "visitStatusModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visit_status_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visit_status_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "visit_status_list",
    timestamps: true,
    underscored: true,
  }
);

export default visitStatusModel;
