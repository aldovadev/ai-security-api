import { DataTypes } from "sequelize";
import db from "../config/database.js";

const roleModel = db.define(
  "roleModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "role_list",
    timestamps: true,
    underscored: true,
  }
);

export default roleModel;
