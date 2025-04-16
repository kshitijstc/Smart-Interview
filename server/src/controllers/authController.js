import {PrismaClient } from "../generated/prisma/client.js"; 
import bcrypt from "bcrypt";    
import jwt from "jsonwebtoken";

const prisma=new PrismaClient();


export const login= async (req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({message:"Please fill all the fields"});
    }

    try{
        const user=await prisma.user.findUnique({where:{email},});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token=jwt.sign(
            // Payload
            {
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
            // secret key
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )
        return res.status(200).json({message:"Login successful",token,user});
    }catch(err){
        console.error("Login Error",err);
        return res.status(500).json({message:"Internal server error"});
    }
}


export const signup= async (req,res)=>{
    const {name,email,password,role}=req.body;

    if(!name || !email || !password || !role){
        return res.status(400).json({message:"Please fill all the fields"});
    }

    try{
        const existingUser=await prisma.user.findUnique({where:{email}});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data: {
              name,
              email,
              role: role.toUpperCase(),
              password: hashedPassword,
            },
          });
          const token = jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );
          
          return res.status(201).json({ message: "User created successfully", token, user });
    }catch(err){
        console.error("Signup Error",err);
        return res.status(500).json({message:"Internal server error"});
    }
};