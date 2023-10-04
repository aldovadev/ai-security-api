import Router from "express";
import { getService, getVisitStatus } from "../controllers/optionController.js";

const router = Router();

router.get("/service", getService);

router.get("/visitStatus", getVisitStatus);

export default router;
