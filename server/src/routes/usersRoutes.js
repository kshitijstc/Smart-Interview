import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/candidates", authMiddleware, async (req, res) => {
    try {
      const candidates = await prisma.user.findMany({
        where: { role: "CANDIDATE" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
  
      res.json(candidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  export default router;