import { Queue, Worker } from "bullmq";
import axios from "axios";
import { PrismaClient } from "../generated/prisma/client.js";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});

const prisma = new PrismaClient();

const evalQueue = new Queue("code-eval", { connection });

const worker = new Worker(
  "code-eval",
  async (job) => {
    console.log("Processing job:", job.id, job.data);
    const {
      roomId,
      step,
      code,
      audioUrl,
      interviewerResponse,
      candidateSummary,
      interviewerFeedback,
    } = job.data;

    const room = await prisma.room.findUnique({ where: { link: roomId } });
    if (!room) throw new Error("Room not found");

    const interviewId = room.interviewId;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { evaluation: true },
    });
    
    const existingEvaluation = interview?.evaluation || {};
    let evaluationData = { ...existingEvaluation };

    if (step === "ai") {

      if (!code || !audioUrl) throw new Error("Both code and audio are required for AI evaluation");
      
      try {
        console.log("Transcribing audio...");
    const audioData = (await axios.get(audioUrl, { responseType: "arraybuffer" })).data;

    const transcriptRes = await axios.post(
      "https://api-inference.huggingface.co/models/openai/whisper-large",
      audioData,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );
    const transcript = transcriptRes.data.text;
    console.log("Transcript:", transcript);


    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content:
              "You are an interview assistant. Given a code snippet and the candidate's verbal explanation (transcript), provide a detailed evaluation including technical feedback, communication assessment, and a score out of 100.",
          },
          {
            role: "user",
            content: `Evaluate this candidate.\n\nCode:\n${code}\n\nTranscript:\n${transcript}`,
          },
        ],
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiEval = aiRes.data.choices[0].message.content;
    evaluationData.ai = aiEval;
      } catch (error) {
        console.error("Error during AI evaluation:", error);
        throw new Error("AI evaluation failed");
      }
    }else if (step === "interviewer") {
      const interviewerData = {
        response: interviewerResponse || "Not provided",
        summary: candidateSummary || "No summary",
        feedback: interviewerFeedback || "No feedback",
        timestamp: new Date().toISOString(),
      };
      evaluationData.interviewer = interviewerData; // Update only interviewer field
      const finalEval = `AI: ${evaluationData.ai || "N/A"}\nAudio: ${evaluationData.audio || "N/A"}\nInterviewer: ${JSON.stringify(interviewerData)}`;
      evaluationData.final = finalEval; // Update final with all existing data
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: { evaluation: evaluationData },
    });
    return { [step]: evaluationData[step], final: evaluationData.final };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed for step: ${job.data.step}`);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed for step: ${job.data.step} with error:`, err.message);
});
worker.on("error", (err) => {
  console.error("Worker error:", err);
});

export { evalQueue };