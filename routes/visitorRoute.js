import Router from "express";
import { uploadVisitor } from "../utils/uploadHandler.js";
import {
  getVisitor,
  createVisitorDetail,
  editVisitorDetail,
  getVisitorProfile,
  uploadVisitorImage,
  changeVisitorImage,
  setupVisitorToday,
  changeVisitorStatus,
  deleteVisitor,
} from "../controllers/visitorController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyRoles from "../middleware/verifyRoles.js";
import verifyEmail from "../middleware/verifyEmail.js";

const router = Router();

router.get(
  "/visitor/:status",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getVisitor
);

router.delete(
  "/visitor/:id",
  verifyToken,
  verifyRoles("Admin", "Company"),
  deleteVisitor
);

router.post("/visitor/detail", verifyEmail, createVisitorDetail);

router.patch(
  "/visitor/detail/:id",
  verifyToken,
  verifyRoles("Company"),
  editVisitorDetail
);

router.post(
  "/visitor/upload/:id",
  uploadVisitor.single("image"),
  verifyEmail,
  uploadVisitorImage
);

router.patch(
  "/visitor/upload/:id",
  uploadVisitor.single("image"),
  verifyToken,
  verifyRoles("Company"),
  changeVisitorImage
);

router.get(
  "/visitor/profile/:id",
  verifyToken,
  verifyRoles("Admin", "Company"),
  getVisitorProfile
);

router.post(
  "/visitor/setup",
  verifyToken,
  verifyRoles("Admin", "Company"),
  setupVisitorToday
);

router.put(
  "/visitor/status",
  verifyToken,
  verifyRoles("Company"),
  changeVisitorStatus
);

export default router;
