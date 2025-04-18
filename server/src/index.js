import express from "express";
import authRoutes from "./routes/authRoutes.js";
import interviewsRoutes from "./routes/interviewsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import audioUploadRoutes from "./routes/audioUploadRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from "./generated/prisma/client.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io/'
});

app.get("/", (req, res) => {
  res.send("🚀 Server is Live and Running!");
});

app.use("/api",authRoutes);
app.use("/api/users",usersRoutes);
app.use("/api/interviews",interviewsRoutes);
app.use("/api/upload",audioUploadRoutes);
app.use("/api/evaluate",evaluationRoutes);

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);
  });

  socket.on('codeChange', async ({ roomId, code }) => {
    socket.to(roomId).emit('codeUpdate', code);
    console.log(`Code received for room ${roomId}:`, code);
    try {
      const room = await prisma.room.findUnique({ where: { link: roomId } });
      if (!room) throw new Error("Room not found");
      const interview = await prisma.interview.findUnique({
        where: { id: room.interviewId }
      });
      const updatedHistory = [...(interview?.codeHistory || []), { code, timestamp: new Date().toISOString() }];
      await prisma.interview.update({
        where: { id: room.interviewId },
        data: { codeHistory: updatedHistory }
      });
      console.log(`Updated code history for interview ${room.interviewId}`);
    } catch (error) {
      console.error("Error updating code history:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});



