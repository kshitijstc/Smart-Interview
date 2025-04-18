import {PrismaClient } from "../generated/prisma/client.js"; 
import {evalQueue} from "../services/queueService.js";

const prisma=new PrismaClient();

export const triggerEvaluation = async (req, res) => {
    const {code,roomId,audioUrl,interviewerResponse,candidateSummary,interviewerFeedback,step} = req.body;

    if(!roomId || (step==="ai" && !code) || (step==="audio" && !audioUrl) || (step==="interviewer" && (!interviewerResponse || !candidateSummary || !interviewerFeedback))){
        return res.status(400).json({error:"Invalid input for step"});
    }

    try {
        await evalQueue.add({ 
            code,
            roomId,
            audioUrl,
            interviewerResponse,
            candidateSummary,
            interviewerFeedback,
            step
        });
        return res.status(200).json({message:"Queued evaluation successfully"});
    } catch (error) {
        console.error("Queue error:", error);
        return res.status(500).json({error:"Error queuing evaluation"});
        
    }
}

export const fetchEvaluation = async (req,res) => {
    const {id} =req.params;
    const {showAI=false}=req.query;

    if(!id) return res.status(400).json({message:"Room ID is required"});

    try {
        const room = await prisma.room.findUnique({
            where:{link:id}
        });
        if(!room) return res.status(404).json({message:"Room not found"});
        const interview = await prisma.interview.findUnique({
            where:{id:room.interviewId},
            select:{evaluation:true},
        });

        const evaluation = interview.evaluation;
        const response = {
            ai: evaluation.ai || null,
            interviewer: evaluation.interviewer || null,
            audio: evaluation.audio || null,
            final: evaluation.final || null,
          };
      
          if (showAI === "false") {
            delete response.ai;
            delete response.audio;
          }
      
          return res.status(200).json(response);
    } catch (error) {
        
    }
} 
