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

const editUser = async (req, res) => {
  const userId = req.params.id;

  const {
    company_name,
    email,
    phone_number,
    address,
    service_id,
    status,
    user_role,
  } = req.body;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const userData = await userModel.findByPk(userId);

    if (!userData) {
      return res.status(404).send({ message: "User not found" });
    }

    userData.company_name = company_name;
    userData.email = email;
    userData.phone_number = phone_number;
    userData.address = address;
    userData.service_id = service_id;
    userData.status = status;
    userData.user_role = user_role;

    await userData.save({ transaction: t });

    await t.commit();

    res
      .status(200)
      .send({ message: "User updated successfully", data: userData });
  } catch (error) {
    if (t) t.rollback();

    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const existingUser = await userModel.findByPk(userId);

    if (!existingUser) {
      return res.status(404).send({ message: "User not found" });
    }

    await existingUser.destroy({ transaction: t });
    await t.commit();

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    if (t) t.rollback();

    res.status(500).send({ error: InternalErrorHandler(error) });
  }
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
