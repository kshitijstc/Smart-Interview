// import { Queue, Worker } from "bullmq";
// import axios from "axios";
// import { PrismaClient } from "../generated/prisma/client.js";
// import { Redis } from "ioredis";
// import ffmpeg from "fluent-ffmpeg";
// import fs from "fs";
// import {v2 as cloudinary} from 'cloudinary';

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

//     const interviewId = room.interviewId;

//     const interview = await prisma.interview.findUnique({
//       where: { id: interviewId },
//       select: { evaluation: true },
//     });

//     const existingEvaluation = interview?.evaluation || {};
//     let evaluationData = { ...existingEvaluation };

//     if (step === "ai") {
//       if (!code || !audioUrl)
//         throw new Error("Both code and audio are required for AI evaluation");

//       try {
//         console.log("Transcribing audio...");
//         const audioResponse = await axios.head(audioUrl);
//         const contentLength = audioResponse.headers["content-length"];
//         let processedAudioUrl = audioUrl;
        
//         if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
//           console.log("Audio size exceeds 10 MB, compressing...");
//           const tempFilePath = `./temp_audio_${Date.now()}.webm`;
//           const writer = fs.createWriteStream(tempFilePath);
//           (await axios.get(audioUrl, { responseType: "stream" })).data.pipe(writer);

//           await new Promise((resolve, reject) => {
//             writer.on("finish", resolve);
//             writer.on("error", reject);
//           });

//           const compressedFilePath = `./compressed_audio_${Date.now()}.webm`;
//           await new Promise((resolve, reject) => {
//             ffmpeg(tempFilePath)
//               .audioBitrate(64)
//               .audioChannels(1)
//               .audioFrequency(16000)
//               .on("end", () => resolve())
//               .on("error", (err) => reject(err))
//               .save(compressedFilePath);
//           });

//           cloudinary.config({
//             cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//             api_key: process.env.CLOUDINARY_API_KEY,
//             api_secret: process.env.CLOUDINARY_API_SECRET,
//           });

//           const compressedUpload = await new Promise((resolve, reject) => {
//             cloudinary.uploader.upload(
//               compressedFilePath,
//               { resource_type: "video" },
//               (error, result) => (error ? reject(error) : resolve(result))
//             );
//           });
//           processedAudioUrl = compressedUpload.secure_url;

//           // Update audio URL
//           await axios.post(
//             `${process.env.BACKEND_URL}/api/interviews/${id}/save-audio-url`,
//             { audioUrl: processedAudioUrl },
//             { headers: { Authorization: `Bearer ${process.env.SERVER_TOKEN}` } }
//           );

//           // Cleanup
//           fs.unlink(tempFilePath, (err) => console.error("Temp file delete error:", err));
//           fs.unlink(compressedFilePath, (err) => console.error("Compressed file delete error:", err));
//         }

//         const audioData = (await axios.get(processedAudioUrl, { responseType: "arraybuffer" })).data;

//         const transcriptRes = await axios.post(
//           "https://api-inference.huggingface.co/models/openai/whisper-large",
//           audioData,
//           {
//             headers: {
//               Authorization: `Bearer ${process.env.HF_API_KEY}`,
//               "Content-Type": "application/octet-stream",
//             },
//           }
//         );
//         const transcript = transcriptRes.data.text;
//         console.log("Transcript:", transcript);

//         const aiRes = await axios.post(
//           "https://openrouter.ai/api/v1/chat/completions",
//           {
//             model: "deepseek/deepseek-chat-v3-0324:free",
//             messages: [
//               {
//                 role: "system",
//                 content:
//                   "You are an interview assistant. Given a code snippet and the candidate's verbal explanation (transcript), provide a detailed evaluation including technical feedback, communication assessment, and a score out of 100.",
//               },
//               {
//                 role: "user",
//                 content: `Evaluate this candidate.\n\nCode:\n${code}\n\nTranscript:\n${transcript}`,
//               },
//             ],
//             max_tokens: 400,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const aiEval = aiRes.data.choices[0].message.content;
//         evaluationData.ai = aiEval;
//       } catch (error) {
//         console.error("Error during AI evaluation:", error);
//         throw new Error("AI evaluation failed");
//       }
//     } else if (step === "interviewer") {
//       const interviewerData = {
//         response: interviewerResponse || "Not provided",
//         summary: candidateSummary || "No summary",
//         feedback: interviewerFeedback || "No feedback",
//         timestamp: new Date().toISOString(),
//       };
//       evaluationData.interviewer = interviewerData; // Update only interviewer field
//       const finalEval = `AI: ${evaluationData.ai || "N/A"}\nAudio: ${
//         evaluationData.audio || "N/A"
//       }\nInterviewer: ${JSON.stringify(interviewerData)}`;
//       evaluationData.final = finalEval; // Update final with all existing data
//     }

//     await prisma.interview.update({
//       where: { id: interviewId },
//       data: { evaluation: evaluationData },
//     });
//     return { [step]: evaluationData[step], final: evaluationData.final };
//   },
//   { connection }
// );

// worker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed for step: ${job.data.step}`);
// });
// worker.on("failed", (job, err) => {
//   console.error(
//     `Job ${job.id} failed for step: ${job.data.step} with error:`,
//     err.message
//   );
// });
// worker.on("error", (err) => {
//   console.error("Worker error:", err);
// });

// export { evalQueue };


import { Queue, Worker } from "bullmq";
import axios from "axios";
import { PrismaClient } from "../generated/prisma/client.js";
import { Redis } from "ioredis";
// import ffmpeg from "fluent-ffmpeg";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import { Readable } from "stream";

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
      transcript,
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
      if (!code || !transcript) throw new Error("Both code and transcript are required for AI evaluation");

      try {
        // console.log("Fetching audio...");
        // const audioStreamResponse = await axios.get(audioUrl, { responseType: "stream" });
        // const audioBuffer = await new Promise((resolve, reject) => {
        //   const chunks = [];
        //   audioStreamResponse.data.on("data", (chunk) => chunks.push(chunk));
        //   audioStreamResponse.data.on("end", () => resolve(Buffer.concat(chunks)));
        //   audioStreamResponse.data.on("error", reject);
        // });

        // let processedAudioUrl = audioUrl;
        // const contentLength = audioBuffer.length;

        // if (contentLength > 10 * 1024 * 1024) {
        //   console.log("Audio size exceeds 10 MB, compressing...");

        //   const tempFilePath = `./temp_audio_${Date.now()}.webm`;
        //   const compressedFilePath = `./compressed_audio_${Date.now()}.webm`;
        //   fs.writeFileSync(tempFilePath, audioBuffer);

        //   await new Promise((resolve, reject) => {
        //     ffmpeg(tempFilePath)
        //       .audioBitrate(64)
        //       .audioChannels(1)
        //       .audioFrequency(16000)
        //       .on("end", resolve)
        //       .on("error", (err) => {
        //         console.error("FFmpeg error:", err);
        //         reject(new Error("FFmpeg not installed or configured properly."));
        //       })
        //       .save(compressedFilePath);
        //   });

        //   // Cloudinary config
        //   cloudinary.config({
        //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        //     api_key: process.env.CLOUDINARY_API_KEY,
        //     api_secret: process.env.CLOUDINARY_API_SECRET,
        //   });

        //   const uploadResult = await new Promise((resolve, reject) => {
        //     cloudinary.uploader.upload(
        //       compressedFilePath,
        //       { resource_type: "video", folder: "interview-audio" },
        //       (error, result) => (error ? reject(error) : resolve(result))
        //     );
        //   });

        //   processedAudioUrl = uploadResult.secure_url;

        //   // Update interview record with new audio URL
        //   await axios.post(
        //     `${process.env.BACKEND_URL}/api/interviews/${interviewId}/save-audio-url`,
        //     { audioUrl: processedAudioUrl },
        //     {
        //       headers: { Authorization: `Bearer ${process.env.SERVER_TOKEN}` },
        //     }
        //   );

        //   // Cleanup temp files
        //   fs.unlink(tempFilePath, () => {});
        //   fs.unlink(compressedFilePath, () => {});
        // }

        // // Get transcript
        // console.log("Transcribing audio...");
        // const processedAudioBuffer = (
        //   await axios.get(processedAudioUrl, { responseType: "arraybuffer" })
        // ).data;

        // const transcriptRes = await axios.post(
        //   "https://api-inference.huggingface.co/models/openai/whisper-large",
        //   processedAudioBuffer,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${process.env.HF_API_KEY}`,
        //       "Content-Type": "application/octet-stream",
        //     },
        //     maxBodyLength: 15 * 1024 * 1024,
        //   }
        // );
        // const transcript = transcriptRes.data.text;
        console.log("Transcript:", transcript);

        // AI evaluation
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
        if (error.message.includes("FFmpeg not installed")) {
          evaluationData.ai = "Error: FFmpeg is not installed on the server.";
        } else if (error.response?.status === 413) {
          evaluationData.ai = "Error: Audio file is too large, even after compression.";
        } else {
          evaluationData.ai = "Error: AI evaluation failed. Please retry.";
        }
      }
    } else if (step === "interviewer") {
      const interviewerData = {
        response: interviewerResponse || "Not provided",
        summary: candidateSummary || "No summary",
        feedback: interviewerFeedback || "No feedback",
        timestamp: new Date().toISOString(),
      };

      evaluationData.interviewer = interviewerData;

      const finalEval = `AI: ${evaluationData.ai || "N/A"}\nAudio: ${
        evaluationData.audio || "N/A"
      }\nInterviewer: ${JSON.stringify(interviewerData)}`;
      evaluationData.final = finalEval;
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: { evaluation: evaluationData },
    });

    return { [step]: evaluationData[step], final: evaluationData.final };
  },
  { connection }
);

// Event listeners
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed for step: ${job.data.step}`);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed for step: ${job.data.step}`, err.message);
});
worker.on("error", (err) => {
  console.error("Worker error:", err);
});

export { evalQueue };
