import Router from "express";
import {
  getService,
  getRole,
  getVisitStatus,
} from "../controllers/optionController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = Router();

router.get("/option/service", verifyToken, verifyRoles("Admin"), getService);

router.get("/option/role", verifyToken, verifyRoles("Admin"), getRole);

router.get(
  "/option/visit-status",
  verifyToken,
  verifyRoles("Admin"),
  getVisitStatus
);

export default router;
