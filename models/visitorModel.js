import { DataTypes, Model } from "sequelize";
import db from "../config/database.js";

const visitorModel = db.define(
  "visitorModel",
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
    address: {
      type: DataTypes.TEXT("medium"),
      allowNull: false,
    },
    company_origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    visit_reason: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    visit_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    visit_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo_path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "visitor_list",
    timestamps: true,
    underscored: true,
  }
);

export default visitorModel;
