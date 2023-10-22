import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(403).send({
      message: "Authorization format error",
      error: "Bearer required",
    });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).send({
        message: "Access token needed to get this access",
        error: "invalid token",
      });
    req.companyName = decoded.userInfo.companyName;
    req.email = decoded.userInfo.email;
    req.userRole = decoded.userInfo.userRole;
    next();
  });
};

export default verifyToken;
