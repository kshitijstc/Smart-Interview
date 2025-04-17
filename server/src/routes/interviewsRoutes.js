import express from 'express';
import {createInterview,getInterviewStats,getMyInterviews,getMyInterviewerInterviews,getInterviewRoom, updateInterviewStatus, saveInterviewCode,saveAudioUrl} from "../controllers/interviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/my', authMiddleware, getMyInterviews);
router.get('/my-interviewer', authMiddleware, getMyInterviewerInterviews);
router.get('/stats',authMiddleware,getInterviewStats);
router.post('/', authMiddleware, createInterview);
router.get('/room/:link', authMiddleware, getInterviewRoom);
router.patch('/room/:link/status', authMiddleware, updateInterviewStatus);
router.post("/:id/save-audio-url", authMiddleware, saveAudioUrl);
router.post("/:id/save-code", authMiddleware, saveInterviewCode);
export default router;
