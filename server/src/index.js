import express from "express";
import authRoutes from "./routes/authRoutes.js";
import interviewsRoutes from "./routes/interviewsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Server is Live and Running!");
});

app.use("/api",authRoutes);
app.use("/api/users",usersRoutes);
app.use("/api/interviews",interviewsRoutes);


app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
