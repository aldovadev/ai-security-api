import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(403).send({ message: "Forbidden access!" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Forbidden access!" });
    req.company_name = decoded.userInfo.company_name;
    req.email = decoded.userInfo.email;
    req.user_role = decoded.userInfo.user_role;
    next();
  });
};

export default verifyToken;
