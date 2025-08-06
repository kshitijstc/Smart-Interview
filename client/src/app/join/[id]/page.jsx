"use client";

import dynamic from "next/dynamic";

const JoinInterviewClient = dynamic(() => import("./JoinInterviewClient"), {
  ssr: false,
});

export default function Page() {
  return <JoinInterviewClient />;
}






