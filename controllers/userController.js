import { Sequelize } from "sequelize";
import db from "../config/database.js";
import userModel from "../models/userModel.js";
import userSchema from "../schemas/userSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";
import bcryptjs from "bcryptjs";

const getUser = async (req, res) => {
  try {
    const userData = await userModel.findAll();
    res.status(200).send({ data: userData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const {
    name,
    email,
    password,
    phone_number,
    address,
    service_id,
    status,
    role_id,
  } = req.body;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const newUser = await userModel.create(
      {
        name: name,
        email: email,
        password: password,
        phone_number: phone_number,
        address: address,
        service_id: service_id,
        status: status,
        role_id: role_id,
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .send({ message: "User created successfully", data: newUser });
  } catch (error) {
    if (t) {
      t.rollback();
    }
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const editUser = (req, res) => {
  res.send({ message: "Edit User Endpoint" });
};

const deleteUser = (req, res) => {
  res.send({ message: "Delete User Endpoint" });
};

const loginUser = (req, res) => {
  res.send({ message: "Login User Endpoint" });
};

const logoutUser = (req, res) => {
  res.send({ message: "Logout User Endpoint" });
};

export { getUser, createUser, editUser, deleteUser, loginUser, logoutUser };
