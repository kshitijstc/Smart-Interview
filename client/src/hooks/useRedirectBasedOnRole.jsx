"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function useRedirectBasedOnRole(){
    const router = useRouter();
    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(!token){
            router.push("/");
            return;
        }
        try{
            const decoded=jwtDecode(token);
            if(decoded.role==="INTERVIEWER"){
                router.push("/dashboard/interviewer");
            }else if(decoded.role==="CANDIDATE"){
                router.push("/dashboard/candidate");
            }else{
                router.push("/");
            }
        }catch(err){
            console.error("JWT decode error:", err);
            localStorage.removeItem("token");
            router.push("/");
        }
    },[router]);
    return null;
};
