import userModel from "../models/userModel.js";
import { userSchema, editUserSchema } from "../schemas/userSchema.js";
import InternalErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

const getUser = async (req, res) => {
  try {
    const userData = await userModel.findAll({
      attributes: {
        exclude: ["password", "refresh_token"],
      },
    });
    res.status(200).send({
      message: "Successfully get user data",
      status: "success",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const createUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const {
    company_name,
    email,
    password,
    phone_number,
    address,
    service_id,
    status,
    user_role,
    url,
  } = req.body;

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await userModel.create({
      company_name: company_name,
      email: email,
      password: hashPassword,
      phone_number: phone_number,
      address: address,
      service_id: service_id,
      status: status,
      user_role: user_role,
      url: url,
    });

    res.status(200).send({
      message: "User created successfully",
      status: "success",
      data: newUser,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const editUser = async (req, res) => {
  const { error } = editUserSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const userId = req.params.id;

  const {
    company_name,
    email,
    phone_number,
    address,
    service_id,
    status,
    user_role,
    url,
  } = req.body;

  try {
    const userData = await userModel.findByPk(userId, {
      attributes: {
        exclude: ["password", "refresh_token"],
      },
    });

    if (!userData) {
      return res.status(404).send({
        message: `User with id ${userId} not found`,
        error: "not found",
      });
    }

    userData.company_name = company_name;
    userData.email = email;
    userData.phone_number = phone_number;
    userData.address = address;
    userData.service_id = service_id;
    userData.status = status;
    userData.user_role = user_role;
    userData.url = url;

    await userData.save();

    res.status(200).send({
      message: `User with id ${userId} updated successfully`,
      status: "success",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const existingUser = await userModel.findByPk(userId);

    if (!existingUser) {
      return res.status(404).send({
        message: `User not with id ${userId} not found`,
        status: "not found",
      });
    }

    await existingUser.destroy();

    res.status(200).send({
      message: `User with id ${userId} deleted successfully`,
      status: "success",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const userProfile = await userModel.findOne({
      where: {
        id: userId,
      },
    });
    res.status(200).send({
      message: `Get user profile with id ${userId}`,
      status: "success",
      data: userProfile,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

export { getUser, createUser, editUser, deleteUser, getUserProfile };
