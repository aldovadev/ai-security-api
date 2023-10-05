import Router from "express";
import {
  getUser,
  createUser,
  editUser,
  deleteUser,
  getUserProfile,
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = Router();

router.get("/user", verifyToken, verifyRoles("Admin"), getUser);

router.post("/user", verifyToken, verifyRoles("Admin"), createUser);

router.delete("/user", verifyToken, verifyRoles("Admin"), deleteUser);

router.patch("/user", verifyToken, verifyRoles("Admin"), editUser);

router.get(
  "/user/profile/:id",
  verifyToken,
  verifyRoles("Admin"),
  getUserProfile
);

export default router;
