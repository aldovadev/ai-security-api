import Router from "express";
import {
  getService,
  getRole,
  getVisitStatus,
  getCompany,
} from "../controllers/optionController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = Router();

router.get("/option/company", getCompany);

router.get(
  "/option/service",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getService
);

router.get(
  "/option/role",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getRole
);

router.get(
  "/option/visit-status",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getVisitStatus
);

export default router;
