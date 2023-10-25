import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyEmail = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader)
        return res.status(403).send({
            message: 'Email verification required',
            error: 'email unverified'
        });

    if (!authHeader?.startsWith('Bearer '))
        return res.status(403).send({
            message: 'Authorization format error',
            error: 'Bearer required'
        });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.OTP_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.status(403).send({
                message: 'Email verification required',
                error: 'email unverified'
            });
        req.email = decoded.email;
        next();
    });
};

export default verifyEmail;
