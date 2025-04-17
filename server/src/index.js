import express from "express";
import authRoutes from "./routes/authRoutes.js";
import interviewsRoutes from "./routes/interviewsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import audioUploadRoutes from "./routes/audioUploadRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);
  });

  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeUpdate', code);
    console.log(`Code received for room ${roomId}:`, code);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});



