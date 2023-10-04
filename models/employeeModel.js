import { DataTypes } from "sequelize";
import db from "../config/database.js";

const employeeModel = db.define(
  "employeeModel",
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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT("medium"),
      allowNull: false,
    },
    photo_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "employee_list",
    timestamps: true,
    underscored: true,
  }
);

export default employeeModel;
