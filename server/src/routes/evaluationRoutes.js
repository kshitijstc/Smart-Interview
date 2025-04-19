import express from "express";
import { triggerEvaluation, fetchEvaluation, triggerEvaluationAI } from "../controllers/evaluationController.js";

const router = express.Router();

router.post("/", triggerEvaluation);
router.post("/:step", triggerEvaluationAI);
router.get("/:id", fetchEvaluation);

export default router;