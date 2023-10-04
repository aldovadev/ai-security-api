import Router from "express";
import {
  getEmployee,
  createEmployee,
  editEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = Router();

router.get("/employee", getEmployee);

router.post("/employee", createEmployee);

router.delete("/employee", editEmployee);

router.patch("/employee", deleteEmployee);

export default router;
