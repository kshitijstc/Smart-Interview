import express from "express";
import { triggerEvaluation, fetchEvaluation } from "../controllers/evaluationController.js";

const router = express.Router();

router.post("/", triggerEvaluation);
router.get("/:id", fetchEvaluation);

export default router;