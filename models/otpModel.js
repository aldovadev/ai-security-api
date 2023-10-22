import { DataTypes } from "sequelize";
import db from "../config/database.js";

const otpModel = db.define(
  "otpModel",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    otpCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "OTP",
    timestamps: true,
  }
);

export default otpModel;
