import { Sequelize } from "sequelize";
import db from "../config/database.js";
import employeeModel from "../models/employeeModel.js";
import employeeSchema from "../schemas/employeeSchema.js";
import InternalErrorHandler from "../utils/errorHandler.js";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

dotenv.config();

const getEmployee = async (req, res) => {
  const company = req.company_name;

  try {
    const employeeData = await employeeModel.findAll({
      where: {
        company: company,
      },
    });

    employeeData.url = `${process.env.IMAGE_URL}/${employeeData.url}`;

    employeeData = res.status(200).send({
      message: "Get employee data success",
      company: company,
      data: employeeData,
    });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createEmployee = async (req, res) => {
  const { error } = employeeSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const company = req.company_name;
  const { name, email, phone_number, gender, employee_id, position, address } =
    req.body;

  const userData = await userModel.findOne({
    where: {
      company_name: company,
    },
  });

  try {
    const newEmployee = await employeeModel.create({
      name: name,
      email: email,
      company: company,
      phone_number: phone_number,
      gender: gender,
      employee_id: employee_id,
      position: position,
      address: address,
      photo_path: `/${userData.id}/${employee_id}`,
    });

    res.status(200).send({
      message: "Employee created successfully",
      status: "success",
      data: newEmployee,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const editEmployee = (req, res) => {
  res.send({ message: "Edit Employee Endpoint" });
};

const deleteEmployee = (req, res) => {
  res.send({ message: "Delete Employee Endpoint" });
};

const getEmployeeProfile = async (req, res) => {
  const id = req.params.id;
  const company = req.company_name;

  try {
    const employeeProfile = await employeeModel.findOne({
      where: {
        id: id,
        company: company,
      },
    });
    res.status(200).send({
      message: "Get employee profile success",
      company: company,
      data: employeeProfile,
    });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

export {
  getEmployee,
  createEmployee,
  editEmployee,
  deleteEmployee,
  getEmployeeProfile,
};
