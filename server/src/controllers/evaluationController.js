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

    console.log("Full interview data:", interview);
    console.log("Code history length:", interview.codeHistory?.length);
    console.log("Code history entries:", interview.codeHistory?.map((entry, index) => ({
      index,
      hasCode: !!entry?.code,
      codeLength: entry?.code?.length || 0,
      timestamp: entry?.timestamp
    })));
    
    // Find the last complete code entry (skip truncated entries)
    let code = null;
    if (interview.codeHistory && interview.codeHistory.length > 0) {
      // Start from the end and find the first complete entry
      for (let i = interview.codeHistory.length - 1; i >= 0; i--) {
        const entry = interview.codeHistory[i];
        if (entry && entry.code && !entry.truncated) {
          code = entry.code;
          console.log(`Found complete code at index ${i}:`, code.substring(0, 100) + "...");
          break;
        }
      }
      
      if (!code) {
        console.log("No complete code entry found in history");
      }
    }

    console.log("Final extracted code:", code ? code.substring(0, 100) + "..." : "null");

    if (step === "ai") {
      if (!code)
        return res.status(400).json({ error: "Code not found in history" });
      
      if (!interview.transcript)
        return res.status(400).json({ error: "No transcript found for this interview. Please record the candidate's explanation first." });

      await evalQueue.add("code-eval", 
      { 
        roomId, 
        step, 
        code,
        transcript: interview.transcript
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
      select: { evaluation: true, transcript: true },
    });

    const evaluation = interview.evaluation || {};
    const response = {
      ai: evaluation.ai || null,
      interviewer: evaluation.interviewer || null,
      final: evaluation.final || null,
      transcript: interview.transcript || null,
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