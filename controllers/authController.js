import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import authSchema from "../schemas/authSchema.js";
import InternalErrorHandler from "../utils/errorHandler.js";
import { sendEmailHandler, OTPEmailTemplate } from "../utils/emailHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Joi from "joi";

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

    if (!userData)
      return res
        .status(404)
        .send({ message: `${email} not found`, error: "not found" });

    const isMatch = await bcrypt.compare(password, userData.password);

    if (isMatch) {
      const accessToken = jwt.sign(
        {
          userInfo: {
            company_name: userData.company_name,
            email: userData.email,
            user_role: userData.user_role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
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
        .send({ message: "Login success", accessToken: accessToken });
    } else {
      res
        .status(401)
        .send({ message: "Wrong email or password", error: "unauthorized" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res
      .status(204)
      .send({ message: "No content detected", error: "missing content" });

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
    return res
      .status(204)
      .send({ message: "No content detected", error: "missing content" });
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
    res.status(200).send({ message: "Logout success", accessToken: null });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res
      .status(401)
      .send({ message: "Unauthorized access", error: "unauthorized" });

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

  if (!userData)
    return res
      .status(403)
      .send({ message: "Forbidden access", error: "forbidden" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || userData.email !== decoded.email)
      res.status(403).send({ message: "Forbidden access", error: "forbidden" });

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

const handleCreateOTP = async (req, res) => {
  const emailSchema = Joi.string()
    .regex(/^\S+@\S+\.\S+$/)
    .required();

  const { error } = emailSchema.validate(req.params.email);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const otp_code = generateOTP();
  const email = req.params.email;
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 3 * 60000);

  var mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Visitor OTP Verification",
    html: OTPEmailTemplate(otp_code),
  };

  try {
    const existingOtp = await otpModel.findOne({
      where: {
        email: email,
      },
    });

    if (!existingOtp) {
      await otpModel.create({
        email: email,
        otp_code: otp_code,
        expired_at: expirationTime,
      });
    } else {
      if (now < existingOtp.expired_at)
        return res.status(500).send({
          message: "OTP still active, please check your email",
          error: "still active",
        });

      existingOtp.otp_code = otp_code;
      existingOtp.expired_at = expirationTime;

      await existingOtp.save();
    }

    return sendEmailHandler(req, res, mailOptions);
  } catch (error) {
    return res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const handleVerifyOTP = async (req, res) => {
  const verifyOtpSchema = Joi.object({
    email: Joi.string()
      .regex(/^\S+@\S+\.\S+$/)
      .required(),
    otp_code: Joi.string().required(),
  });

  const { error } = verifyOtpSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const now = new Date();
  const { email, otp_code } = req.body;

  try {
    const existingOtp = await otpModel.findOne({
      where: {
        email: email,
        otp_code: otp_code,
      },
    });

    if (!existingOtp)
      return res.status(401).send({
        message: "Email and otp did not match",
        error: "wrong otp",
      });

    if (now > existingOtp.expired_at) {
      return res.status(401).send({
        message: "OTP code has been expired or already used",
        error: "invalid otp",
      });
    }

    const otpToken = jwt.sign(
      {
        email: existingOtp.email,
      },
      process.env.OTP_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    existingOtp.expired_at = now.setMinutes(now.getMinutes() - 3);
    await existingOtp.save();

    return res
      .status(200)
      .send({ message: "Verification success", otpToken: otpToken });
  } catch (error) {
    return res.status(500).send({
      message: "Server failed to process this request",
      message: InternalErrorHandler(error),
    });
  }
};

export {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleCreateOTP,
  handleVerifyOTP,
};

function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
