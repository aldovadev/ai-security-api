import { Sequelize } from "sequelize";
import db from "../config/database.js";
import userModel from "../models/userModel.js";
import userSchema from "../schemas/userSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

const getUser = async (req, res) => {
  try {
    const userData = await userModel.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    res.status(200).send({ message: "Get user success", data: userData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);

  if (error) return res.status(400).send({ error: error.details[0].message });

  const {
    company_name,
    email,
    password,
    phone_number,
    address,
    service_id,
    status,
    user_role,
  } = req.body;

  const hashPassword = await bcrypt.hash(password, 10);

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const newUser = await userModel.create(
      {
        company_name: company_name,
        email: email,
        password: hashPassword,
        phone_number: phone_number,
        address: address,
        service_id: service_id,
        status: status,
        user_role: user_role,
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .send({ message: "User created successfully", data: newUser });
  } catch (error) {
    if (t) t.rollback();

    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const editUser = (req, res) => {
  res.send({ message: "Edit User Endpoint" });
};

const deleteUser = (req, res) => {
  res.send({ message: "Delete User Endpoint" });
};

const getUserProfile = async (req, res) => {
  const id = req.params.id;

  try {
    const userProfile = await userModel.findOne({
      where: {
        id: id,
      },
    });
    res
      .status(200)
      .send({ message: "Get user profile success", data: userProfile });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

export { getUser, createUser, editUser, deleteUser, getUserProfile };
