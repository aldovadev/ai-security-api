import { DataTypes } from "sequelize";
import db from "../config/database.js";

const otpModel = db.define(
  "otpModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otp_list",
    timestamps: true,
    underscored: true,
  }
);

export default otpModel;
