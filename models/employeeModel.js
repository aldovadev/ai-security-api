import { DataTypes } from "sequelize";
import db from "../config/database.js";

const employeeModel = db.define(
  "employeeModel",
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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
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
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photoPath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Employee",
    timestamps: true,
  }
);

export default employeeModel;
