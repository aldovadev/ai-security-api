import userModel from "../models/userModel.js";
import authSchema from "../schemas/authSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const handleLogin = async (req, res) => {
  const { error } = authSchema.validate(req.body);

  if (error) return res.status(400).send({ error: error.details[0].message });

  const { email, password } = req.body;

  try {
    const userData = await userModel.findOne({
      where: {
        email: email,
      },
      attributes: [
        "company_name",
        "email",
        "password",
        "user_role",
        "refresh_token",
      ],
    });

    console.log(userData);

    if (!userData)
      return res.status(404).send({ message: `${email} not found!` });

    const isMatch = await bcrypt.compare(password, userData.password);

    if (isMatch) {
      const accesToken = jwt.sign(
        {
          userInfo: {
            company_name: userData.company_name,
            email: userData.email,
            user_role: userData.user_role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        {
          email: userData.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      await userModel.update(
        { refresh_token: refreshToken },
        {
          where: {
            email: userData.email,
          },
        }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .send({ message: "Logout success", accesToken: accesToken });
    } else {
    }
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(204).send({ message: "No content!" });

  const refreshToken = cookies.jwt;

  const userData = userModel.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!userData) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.status(204).send({ message: "No content!" });
  }

  try {
    await userModel.update(
      { refresh_token: null },
      {
        where: {
          refresh_token: refreshToken,
        },
      }
    );

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.status(200).send({ message: "Logout success", accesToken: null });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(401).send({ message: "Unauthorized access!" });

  const refreshToken = cookies.jwt;

  const userData = await userModel.findOne({
    where: {
      refresh_token: refreshToken,
    },
    attributes: [
      "company_name",
      "email",
      "password",
      "user_role",
      "refresh_token",
    ],
  });

  if (!userData) return res.status(403).send({ message: "Forbidden access!" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || userData.email !== decoded.email)
      res.status(403).send({ message: "Forbidden access!" });

    const accessToken = jwt.sign(
      {
        userInfo: {
          company_name: userData.company_name,
          email: decoded.email,
          user_role: userData.user_role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res
      .status(200)
      .send({ message: "Refresh token success", accessToken: accessToken });
  });
};

export { handleLogin, handleLogout, handleRefreshToken };
