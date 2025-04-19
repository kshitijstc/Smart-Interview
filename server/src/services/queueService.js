// import { Queue, Worker } from "bullmq";
// import axios from "axios";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { Redis } from "ioredis";

// const connection = new Redis(process.env.REDIS_URL, {
//   tls: {},
//   maxRetriesPerRequest: null,
// });

// const prisma = new PrismaClient();

// const evalQueue = new Queue("code-eval", { connection });

// const worker = new Worker(
//   "code-eval",
//   async (job) => {

//     console.log("Processing job:", job.id, job.data);
//     const {
//       roomId,
//       step,
//       code,
//       audioUrl,
//       interviewerResponse,
//       candidateSummary,
//       interviewerFeedback,
//     } = job.data;

//     const room = await prisma.room.findUnique({ where: { link: roomId } });
//     if (!room) throw new Error("Room not found");

//     const interviewId = room.interviewId; // Add this line

//     let evaluationData =
//       (await prisma.interview.findUnique({
//         where: { id: interviewId },
//         select: { evaluation: true },
//       })?.evaluation) || {};

//     if (step === "ai") {
//       if (!code) throw new Error("Code is required for AI evaluation");
//       // console.log("Code for evaluation:", code);
//       try{
//       const res = await axios.post(
//         "https://openrouter.ai/api/v1/chat/completions",
//         {
//           model: "deepseek/deepseek-chat-v3-0324:free",
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a code review assistant. You will be given a code snippet and you will provide feedback and detailed remark on the code. You will also provide a score out of 100 for the code.",
//             },
//             {
//               role: "user",
//               content: `Please evaluate the following code and provide feedback and a score out of 100. Code: \n${code}\n`,
//             },
//           ],
//           max_tokens: 200,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("AI Response:", res.data);
//       evaluationData.ai = res.data.choices[0].message.content;
//     }catch (error) {
//       console.error("Error during AI evaluation:", error);
//       throw new Error("AI evaluation failed");
//     }
//       await prisma.interview.update({
//         where: { id: interviewId },
//         data: { evaluation: evaluationData },
//       });
//       return { ai: evaluationData.ai };
//     } else if (step === "audio") {
//       if (!audioUrl) throw new Error("Audio URL is required for audio evaluation");

//       try{
//         const audioData = (await axios.get(audioUrl, { responseType: "arraybuffer" })).data;
//       const res = await axios.post(
//         "https://api-inference.huggingface.co/models/openai/whisper-large",
//         audioData,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.HF_API_KEY}`,
//             "Content-Type": "application/octet-stream",
//           },
//         }
//       );
//       console.log("Audio Response:", res.data);
//       const transcript = res.data.text;
//       evaluationData.audio = `Audio transcription: ${transcript}. Evaluation: Based on speech, candidate's communication seems clear.`;
//       }catch (error) {
//         console.error("Audio API Error:", error.message);
//         throw error; // Rethrow to mark job as failed
//       }
      
//       await prisma.interview.update({
//         where: { id: interviewId },
//         data: { evaluation: evaluationData },
//       });
//       return { audio: evaluationData.audio };
//     } else if (step === "interviewer") {
//       const interviewerData = {
//         response: interviewerResponse || "Not provided",
//         summary: candidateSummary || "No summary",
//         feedback: interviewerFeedback || "No feedback",
//         timestamp: new Date().toISOString(),
//       };
//       evaluationData.interviewer = interviewerData;
//       const finalEval = `AI: ${evaluationData.ai || "N/A"}\nAudio: ${evaluationData.audio || "N/A"}\nInterviewer: ${JSON.stringify(interviewerData)}}`;
//       evaluationData.final = finalEval;
//       await prisma.interview.update({
//         where: { id: interviewId },
//         data: { evaluation: evaluationData },
//       });
//       return { interviewer: interviewerData, final: finalEval };
//     }
//   },
//   { connection }
// );

// worker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed for step: ${job.data.step}`);
// });
// worker.on("failed", (job, err) => {
//   console.error(`Job ${job.id} failed for step: ${job.data.step} with error:`, err.message);
// });
// worker.on("error", (err) => {
//   console.error("Worker error:", err);
// });

// export { evalQueue };

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

    // Fetch existing evaluation data and merge new data
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { evaluation: true },
    });
    
    const existingEvaluation = interview?.evaluation || {};
    

    let evaluationData = { ...existingEvaluation };

    if (step === "ai") {
      if (!code) throw new Error("Code is required for AI evaluation");
      try {
        const res = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "deepseek/deepseek-chat-v3-0324:free",
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
        console.log("AI Response:", res.data);
        evaluationData.ai = res.data.choices[0].message.content; // Update only AI field
      } catch (error) {
        console.error("Error during AI evaluation:", error);
        throw new Error("AI evaluation failed");
      }
    } else if (step === "audio") {
      if (!audioUrl) throw new Error("Audio URL is required for audio evaluation");
      try {
        const audioData = (await axios.get(audioUrl, { responseType: "arraybuffer" })).data;
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
        console.log("Audio Response:", res.data);
        const transcript = res.data.text;
        evaluationData.audio = `Audio transcription: ${transcript}. Evaluation: Based on speech, candidate's communication seems clear.`; // Update only audio field
      } catch (error) {
        console.error("Audio API Error:", error.message);
        throw error; // Rethrow to mark job as failed
      }
    } else if (step === "interviewer") {
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