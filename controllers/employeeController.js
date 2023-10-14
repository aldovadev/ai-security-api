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
    res.status(200).send({
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
    res.status(200).send({
      message: "Employee created successfully",
      company: company,
      data: newEmployee,
    });
  } catch (error) {
    if (t) {
      t.rollback();
    }

    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const editEmployee = async (req, res) => {
  const employeeId = req.params.id; 
  const { name, email, phone_number, gender, employee_id, position, address } = req.body; 

  const { error } = employeeSchema.validate(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  try {
    const existingEmployee = await employeeModel.findByPk(employeeId);

    if (!existingEmployee) {
      return res.status(404).send({ message: "Employee not found" });
    }

    await existingEmployee.update({
      name: name,
      email: email,
      phone_number: phone_number,
      gender: gender,
      employee_id: employee_id,
      position: position,
      address: address,
    });

    res.status(200).send({
      message: "Employee data updated successfully",
      data: existingEmployee,
    });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const deleteEmployee = async (req, res) => {
  const employeeId = req.params.id;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const existingEmployee = await employeeModel.findByPk(employeeId);

    if (!existingEmployee) {
      return res.status(404).send({ message: "Employee not found" });
    }

    await existingEmployee.destroy({ transaction: t });
    await t.commit();

    res.status(200).send({ message: "Employee deleted successfully" });
  } catch (error) {
    if (t) t.rollback();

    res.status(500).send({ error: InternalErrorHandler(error) });
  }
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
