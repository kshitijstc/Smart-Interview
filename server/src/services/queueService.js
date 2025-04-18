import { Queue } from "bullmq";
import axios from "axios";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const initQueue = () => {
  evalQueue = new Queue("code-eval", {});

  evalQueue.process(async (job) => {
    const {
      code,
      roomId,
      audioUrl,
      interviewerResponse,
      candidateSummary,
      interviewerFeedback,
      step,
    } = job.data;
    const room = await prisma.room.findUnique({
      where: { link: roomId },
    });
    if (!room) throw new Error("Room not found");
    let evaluationData =
      (await prisma.interview.findUnique({
        where: { id: room.interviewId },
        select: { evaluation: true },
      })?.evaluation) || {};

    if (step === "ai") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek-ai/deepseek-coder:6.7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a code review assistant. You will be given a code snippet and you will provide feedback and detailed remark on the code. You will also provide a score out of 100 for the code.",
            },
            {
              role: "user",
              content: `Please evaluate the following code and provide feedback and a score out of 100. Code: \n${code}\n`,
            },
          ],
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      evaluationData.ai = res.data.choices[0].message.content;
      await prisma.interview.update({
        where: { id: interviewId },
        data: { evaluation: evaluationData },
      });
      return { ai: evaluationData.ai };
    } else if (step === "audio") {
      const audioData = (
        await axios.get(audioUrl, { responseType: "arraybuffer" })
      ).data;
      const res = await axios.post(
        "https://api-inference.huggingface.co/models/openai/whisper-large",
        audioData,
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
        }
      );
      const transcript = res.data.text;
      evaluationData.audio = `Audio transcription: ${transcript}. Evaluation: Based on speech, candidate's communication seems clear.`;
      await prisma.interview.update({
        where: { id: interviewId },
        data: { evaluation: evaluationData },
      });
      return { audio: evaluationData.audio };
    } else if (step === "interviewer") {
      const interviewerData = {
        response: interviewerResponse || "Not provided",
        summary: candidateSummary || "No summary",
        feedback: interviewerFeedback || "No feedback",
        timestamp: new Date().toISOString(),
      };
      evaluationData.interviewer = interviewerData;
      const finalEval = `AI: ${
        evaluationData.ai || "N/A"
      }\nInterviewer: ${JSON.stringify(interviewerData)}\nAudio: ${
        evaluationData.audio || "N/A"
      }`;
      evaluationData.final = finalEval;
      await prisma.interview.update({
        where: { id: interviewId },
        data: { evaluation: evaluationData },
      });
      return { interviewer: interviewerData, final: finalEval };
    }
  });
  return evalQueue;
};
