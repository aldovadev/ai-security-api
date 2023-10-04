import { Sequelize } from "sequelize";
import db from "../config/database.js";
import employeeModel from "../models/employeeModel.js";
import employeeSchema from "../schemas/employeeSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";

const getEmployee = async (req, res) => {
  try {
    const employeeData = await employeeModel.findAll();
    res.status(200).send({ data: employeeData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createEmployee = async (req, res) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
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

export { getEmployee, createEmployee, editEmployee, deleteEmployee };
