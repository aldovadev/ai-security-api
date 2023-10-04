import Router from "express";
import {
  getVisitor,
  createVisitor,
  deleteVisitor,
  editVisitor,
} from "../controllers/visitorController.js";

const router = Router();

router.get("/visitor/:status", getVisitor);

router.post("/visitor", createVisitor);

router.patch("/visitor", editVisitor);

router.delete("/visitor", deleteVisitor);

export default router;
