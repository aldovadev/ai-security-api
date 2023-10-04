import Router from "express";
import {
  getService,
  getRole,
  getVisitStatus,
} from "../controllers/optionController.js";

const router = Router();

router.get("/service", getService);

router.get("/role", getRole);

router.get("/visitStatus", getVisitStatus);

export default router;
