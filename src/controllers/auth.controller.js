import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Joi from 'joi';

import { sendOTPEmailHandler } from '../utils/emailHandler.js';
import authSchema from '../schemas/auth.schema.js';
import InternalErrorHandler from '../utils/errorHandler.js';
import userModel from '../models/user.model.js';
import otpModel from '../models/otp.model.js';

const handleLogin = async (req, res) => {
    const { error } = authSchema.validate(req.body);

    if (error) return res.status(400).send({ error: error.details[0].message });

    const authData = req.body;

    try {
        const userData = await userModel.findOne({
            where: {
                email: authData.email
            }
        });

        if (!userData) return res.status(404).send({ message: `email not found`, error: 'not found' });

        const isMatch = await bcrypt.compare(authData.password, userData.password);

        if (isMatch) {
            const accessToken = jwt.sign(
                {
                    userInfo: {
                        id: userData.id,
                        companyName: userData.companyName,
                        email: userData.email,
                        userRole: userData.userRole
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );

            const refreshToken = jwt.sign(
                {
                    email: userData.email
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            await userModel.update(
                { refreshToken: refreshToken },
                {
                    where: {
                        email: userData.email
                    }
                }
            );

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).send({ message: 'Login success', accessToken: accessToken });
        } else {
            res.status(401).send({ message: 'Wrong email or password', error: 'unauthorized' });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const handleLogout = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(204).send({ message: 'No content detected', error: 'missing content' });

    const refreshToken = cookies.jwt;

    const userData = userModel.findOne({
        where: {
            refreshToken: refreshToken
        }
    });

    if (!userData) {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        return res.status(204).send({ message: 'No content detected', error: 'missing content' });
    }

    try {
        await userModel.update(
            { refreshToken: null },
            {
                where: {
                    refreshToken: refreshToken
                }
            }
        );

        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        res.status(200).send({ message: 'Logout success', accessToken: null });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).send({ message: 'Unauthorized access', error: 'unauthorized' });

    const refreshToken = cookies.jwt;

    const userData = await userModel.findOne({
        where: {
            refreshToken: refreshToken
        }
    });

    if (!userData) return res.status(403).send({ message: 'Forbidden access', error: 'forbidden' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || userData.email !== decoded.email) res.status(403).send({ message: 'Forbidden access', error: 'forbidden' });

        const accessToken = jwt.sign(
            {
                userInfo: {
                    companyName: userData.companyName,
                    email: decoded.email,
                    userRole: userData.userRole
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        res.status(200).send({ message: 'Refresh token success', accessToken: accessToken });
    });
};

const handleCreateOTP = async (req, res) => {
    const emailSchema = Joi.string()
        .regex(/^\S+@\S+\.\S+$/)
        .required();

    const { error } = emailSchema.validate(req.params.email);

    if (error) return res.status(400).send({ message: error.details[0].message, error: 'bad request' });

    const otpCode = generateOTP();
    const email = req.params.email;
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 3 * 60000);

    console.log(now);

    try {
        const existingOtp = await otpModel.findOne({
            where: {
                email: email
            }
        });

        if (!existingOtp) {
            await otpModel.create({
                email: email,
                otpCode: otpCode,
                expiredAt: expirationTime
            });
        } else {
            if (now < existingOtp.expiredAt)
                return res.status(500).send({
                    message: 'OTP still active, please check your email',
                    error: 'still active',
                    expiredAt: expirationTime
                });

            existingOtp.otpCode = otpCode;
            existingOtp.expiredAt = expirationTime;

            await existingOtp.save();
        }

        return sendOTPEmailHandler(req, res);
    } catch (error) {
        return res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const handleVerifyOTP = async (req, res) => {
    const verifyOtpSchema = Joi.object({
        email: Joi.string()
            .regex(/^\S+@\S+\.\S+$/)
            .required(),
        otpCode: Joi.string().required()
    });

    const { error } = verifyOtpSchema.validate(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message, error: 'bad request' });

    const now = new Date();
    const otpData = req.body;

    try {
        const existingOtp = await otpModel.findOne({
            where: {
                email: otpData.email,
                otpCode: otpData.otpCode
            }
        });

        if (!existingOtp)
            return res.status(401).send({
                message: 'Email and otp did not match',
                error: 'wrong otp'
            });

        if (now > existingOtp.expiredAt) {
            return res.status(401).send({
                message: 'OTP code has been expired or already used',
                error: 'invalid otp'
            });
        }

        const otpToken = jwt.sign(
            {
                email: existingOtp.email
            },
            process.env.OTP_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        existingOtp.expiredAt = now.setMinutes(now.getMinutes() - 3);
        await existingOtp.save();

        return res.status(200).send({ message: 'Verification success', otpToken: otpToken });
    } catch (error) {
        return res.status(500).send({
            message: 'Server failed to process this request',
            message: InternalErrorHandler(error)
        });
    }
};

export { handleLogin, handleLogout, handleRefreshToken, handleCreateOTP, handleVerifyOTP };

const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
