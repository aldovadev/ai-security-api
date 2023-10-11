import Router from "express";
import {
  getVisitor,
  createVisitor,
  deleteVisitor,
  editVisitor,
  getVisitorProfile,
  getUpload,
} from "../controllers/visitorController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";

const router = Router();

router.get(
  "/visitor/:status",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getVisitor
);

router.post("/visitor", getUpload, createVisitor);

router.patch(
  "/visitor",
  verifyToken,
  verifyRoles("Admin", "Company"),
  editVisitor
);

router.delete(
  "/visitor",
  verifyToken,
  verifyRoles("Admin", "Company"),
  deleteVisitor
);

router.get(
  "/visitor/profile/:id",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getVisitorProfile
);

export default router;
