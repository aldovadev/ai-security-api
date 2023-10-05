import { Sequelize } from "sequelize";
import db from "../config/database.js";
import employeeModel from "../models/employeeModel.js";
import employeeSchema from "../schemas/employeeSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";

const getEmployee = async (req, res) => {
  const company = req.company_name;

  try {
    const employeeData = await employeeModel.findAll({
      where: {
        company: company,
      },
    });
    res.status(200).send({ data: employeeData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createEmployee = async (req, res) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const company = req.company_name;

  console.log(company);

  const { name, email, phone_number, gender, employee_id, position, address } =
    req.body;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const newEmployee = await employeeModel.create(
      {
        name: name,
        email: email,
        company: company,
        phone_number: phone_number,
        gender: gender,
        employee_id: employee_id,
        position: position,
        address: address,
        photo_path: `/employee/${employee_id}`,
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .send({ message: "Employee created successfully", newEmployee });
  } catch (error) {
    if (t) {
      t.rollback();
    }

    res.status(500).send({ error: InternalErrorHandler(error) });
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
    res.status(200).send({ data: employeeProfile });
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
