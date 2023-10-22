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

  const userData = req.body;

  const hashPassword = await bcrypt.hash(userData.password, 10);

  try {
    const newUser = await userModel.create({
      companyName: userData.companyName,
      email: userData.email,
      password: hashPassword,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      serviceId: userData.serviceId,
      status: userData.status,
      userRole: userData.userRole,
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

  const updateUserData = req.body;

  try {
    const userData = await userModel.findByPk(userId, {
      attributes: {
        exclude: ["password", "refresh_token"],
      },
    });

    if (!userData) {
      return res.status(404).send({
        message: `User with with this id not found`,
        error: "not found",
      });
    }

    userData.companyName = updateUserData.companyName;
    userData.email = updateUserData.email;
    userData.phoneNumber = updateUserData.phoneNumber;
    userData.address = updateUserData.address;
    userData.serviceId = updateUserData.serviceId;
    userData.status = updateUserData.status;
    userData.userRole = updateUserData.userRole;

    await userData.save();

    res.status(200).send({
      message: `User with this id updated successfully`,
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
        message: `User not with this id not found`,
        status: "not found",
      });
    }

    await existingUser.destroy();

    res.status(200).send({
      message: `User with this id deleted successfully`,
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
    const userProfile = await userModel.findByPk(userId);

    res.status(200).send({
      message: `Get user profile with this id`,
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
