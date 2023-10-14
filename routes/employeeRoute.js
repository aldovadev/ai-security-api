import Router from "express";
import {
  getEmployee,
  createEmployee,
  editEmployee,
  deleteEmployee,
  getEmployeeProfile,
} from "../controllers/employeeController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = Router();

router.get(
  "/employee",
  verifyToken,
  verifyRoles("Company", "Admin"),
  getEmployee
);

router.post(
  "/employee",
  verifyToken,
  verifyRoles("Company", "Admin"),
  createEmployee
);

router.patch(
  "/employee/:id",
  verifyToken,
  verifyRoles("Company", "Admin"),
  editEmployee
);

router.delete(
  "/employee/:id",
  verifyToken,
  verifyRoles("Company", "Admin"),
  deleteEmployee
);

router.get(
  "/employee/profile/:id",
  verifyToken,
  verifyRoles("Company", "Admin"),
  getEmployeeProfile
);

export default router;
