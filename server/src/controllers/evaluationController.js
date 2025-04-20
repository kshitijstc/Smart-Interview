import { PrismaClient } from "../generated/prisma/client.js";
import { evalQueue } from "../services/queueService.js";

const prisma = new PrismaClient();

export const triggerEvaluationAI = async (req, res) => {
  const { roomId, step } = req.body;

  if (!roomId || !step) {
    return res.status(400).json({ error: "Room ID and step are required" });
  }

  try {
    const room = await prisma.room.findUnique({ where: { link: roomId } });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const interview = await prisma.interview.findUnique({
      where: { id: room.interviewId },
    });
    if (!interview)
      return res.status(404).json({ error: "Interview not found" });

    const code =
      interview.codeHistory?.length > 0
        ? interview.codeHistory[interview.codeHistory.length - 1].code
        : null;
    // console.log("Evaluation Controller code:", code); // Debugging line
    const audioUrl = interview.audioUrl;

    if (step === "ai") {
      if (!code)
        return res.status(400).json({ error: "Code not found in history" });
      await evalQueue.add("code-eval", 
      { 
        roomId, 
        step, 
        code,
        audioUrl 
      },
      {
        removeOnComplete: {
          age: 18000, // 5 hours
        },
        removeOnFail: {
          age: 18000, // Optional
        },
      });
      return res
        .status(200)
        .json({ message: "Queued code evaluation successfully" });
    }
    return res.status(400).json({ error: "Invalid step value" });
  } catch (error) {
    console.error("Queue error:", error);
    return res.status(500).json({ error: "Error queuing evaluation", details: error.message });
  }
};

export const triggerEvaluation = async (req, res) => {
  const {
    roomId,
    interviewerResponse,
    candidateSummary,
    interviewerFeedback,
    step,
  } = req.body;

  if (!roomId || !step) {
    return res.status(400).json({ error: "Room ID and step are required" });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { link: roomId },
    });

    if (!room) return res.status(404).json({ error: "Room not found" });

    await evalQueue.add("code-eval", {
      roomId,
      interviewerResponse,
      interviewerFeedback,
      candidateSummary,
      step,
    },
    {
      removeOnComplete: {
        age: 18000, // 5 hours
      },
      removeOnFail: {
        age: 18000, // Optional
      },
    }); // Explicit job name and data
    return res.status(200).json({ message: "Queued evaluation successfully" });
  } catch (error) {
    console.error("Queue error:", error);
    return res.status(500).json({ error: "Error queuing evaluation", details: error.message });
  }
};

export const fetchEvaluation = async (req, res) => {
  const { id } = req.params;
  const { showAI = false } = req.query;

  if (!id) return res.status(400).json({ message: "Room ID is required" });

  try {
    const room = await prisma.room.findUnique({
      where: { link: id },
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    const interview = await prisma.interview.findUnique({
      where: { id: room.interviewId },
      select: { evaluation: true },
    });

    const evaluation = interview.evaluation || {};
    const response = {
      ai: evaluation.ai || null,
      interviewer: evaluation.interviewer || null,
      final: evaluation.final || null,
    };

    if (showAI === "false") {
      delete response.ai;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: "Error fetching evaluation", details: error.message });
  }
};