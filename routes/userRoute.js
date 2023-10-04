import Router from "express";
import {
  getUser,
  createUser,
  logoutUser,
  loginUser,
  editUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/user", getUser);

router.post("/user", createUser);

router.delete("/user", deleteUser);

router.patch("/user", editUser);

router.post("/user/login", loginUser);

router.post("/user/logout", logoutUser);

export default router;
