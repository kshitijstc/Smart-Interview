"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function useRedirectBasedOnRole(){
    const router = useRouter();
    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(!token){
            router.push("/login");
            return;
        }
        try{
            const decoded=jwtDecode(token);
            if(decoded.role==="INTERVIEWER"){
                router.push("/dashboard/interviewer");
            }else if(decoded.role==="CANDIDATE"){
                router.push("/dashboard/candidate");
            }else{
                router.push("/login");
            }
        }catch(err){
            console.error("JWT decode error:", err);
            localStorage.removeItem("token");
            router.push("/login");
        }
    },[router]);
    return null;
};
