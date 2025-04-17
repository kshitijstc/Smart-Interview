import {PrismaClient } from "../generated/prisma/client.js"; 
import jwt from "jsonwebtoken";

const prisma=new PrismaClient();

export const getMyInterviews = async (req, res) => {
  try {
    // console.log("Muttu:", req.user);
    const candidateId = req.user.id;

    const interviews = await prisma.interview.findMany({
      where: { candidateId },
      include: {
        interviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        evaluation: true,
        room: true ,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
    // console.log("Interviews:", interviews);
    res.status(201).json(interviews)
  } catch (err) {
    console.error("Error fetching candidate interviews:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getMyInterviewerInterviews = async (req, res) => {
  try {
    const interviewerId = req.user.id;

    const interviews = await prisma.interview.findMany({
      where: { interviewerId },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        evaluation: true,
        room: true ,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    res.status(200).json(interviews);
  } catch (err) {
    console.error("Error fetching interviewer interviews:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


export const getInterviewStats = async (req, res) => {
  const userId=req.user.id;
  // console.log("User:", req.user);
  try{
    const total=await prisma.interview.count({where:{interviewerId:userId}});
    const completed=await prisma.interview.count({where:{interviewerId:userId,status:"COMPLETED"}});
    const scheduled=await prisma.interview.count({where:{interviewerId:userId,status:"SCHEDULED"}});
    const noShows=await prisma.interview.count({where:{interviewerId:userId,status:"NO_SHOW"}});
    return res.status(200).json({total,completed,scheduled,noShows});
  }catch(err){
    console.error("Error fetching interview stats:", err);
    return res.status(500).json({error:"Server error"});
  }
};

export const createInterview = async (req, res) => {
  const { candidateId, scheduledAt } = req.body;
  const interviewerId = req.user.id;

  if (!candidateId || !scheduledAt) {
    return res.status(400).json({ error: "Missing candidateId or scheduledAt" });
  }

  try {
    const newInterview = await prisma.interview.create({
      data: {
        candidateId,
        interviewerId,
        scheduledAt: new Date(scheduledAt),
        status: "SCHEDULED",
        room: {
          create: {
            link: `${interviewerId}_${Date.now()}`,
            roomName: `${interviewerId}_${Date.now()}`,
          },
        },
      },
    });

    res.status(201).json(newInterview);
  } catch (err) {
    console.error("Error creating interview:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getInterviewRoom = async (req, res) => {
  const { link } = req.params;
  try {
    const room = await prisma.room.findUnique({ where: { link } });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const jwtSecret = `-----BEGIN PRIVATE KEY-----\n${process.env.JAAS_JWT_SECRET}\n-----END PRIVATE KEY-----`;
    const appId = process.env.JAAS_APP_ID;
    const keyId = process.env.JAAS_KEY_ID;
    const token = jwt.sign(
      {
        aud: "jitsi",
        iss: "chat",
        sub: appId,
        room: link,
        context: { user: { 
          role: req.user.role ,
          moderator: req.user.role === "INTERVIEWER" ? "true" : "false", 
        } }
      },
      jwtSecret,
      { 
        expiresIn: '3h',
        algorithm: 'RS256', 
        header: {
          kid: keyId 
        }
      }
    );
    res.status(200).json({ role: req.user.role , room, jwt: token });
  } catch (err) {
    console.error("Error fetching interview room:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const updateInterviewStatus = async (req, res) => {
  const { link } = req.params;
  const { status } = req.body;

  try {
    // Get Room by roomName (assuming format = `${interviewerId}${interviewId}`)
    const room = await prisma.room.findUnique({
      where: { link },
    });

    // if (!room || !room.interview) {
    //   return res.status(404).json({ error: "Interview not found via roomName" });
    // }

    const updated = await prisma.interview.update({
      where: { id: room.interviewId },
      data: { status },
    });

    console.log("Updated Interview status successfully");
    return res.status(200);
  }catch(err){
    console.error("Error updating interview status:", err);
    return res.status(500).json({error:"Server error"});
  }
}

export const saveInterviewCode = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;

  try {
    const room = await prisma.room.findUnique({
      where: { link:id },
    });
    await prisma.interview.update({
      where: { id: room.interviewId },
      data: { candidateCode: code },
    });
    res.json({ message: "Code saved" });
  } catch (error) {
    console.error("Error saving code:", error);
    res.status(500).json({ error: "Could not save code" });
  }
};


export const saveAudioUrl = async (req, res) => {
  const { id } = req.params;
  const { audioUrl } = req.body;
  try {
    const room = await prisma.room.findUnique({
      where: { link:id },
    });
    await prisma.interview.update({
      where: { id: room.interviewId },
      data: { audioUrl }
    });
    console.log(`Saved audio URL for room ${id}: ${audioUrl}`);
    res.status(200).json({ message: "Audio URL saved" });
  } catch (err) {
    console.error("Failed to save audio URL:", err);
    res.status(500).json({ error: "Failed to save audio URL" });
  } 
};