"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";
// import dynamic from "next/dynamic";
import socket from "@/lib/socket";

// Dynamically import Editor to avoid SSR issues
const Editor = lazy(() => import("@monaco-editor/react"));
// const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function JoinInterview() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [code, setCode] = useState("// Start coding here...");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    socket.emit("joinRoom", id);
  
    socket.on("codeUpdate", (incomingCode) => {
      setCode(incomingCode);
    });
  
    return () => {
      socket.off("codeUpdate");
    };
  }, [id]);
  
  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("codeChange", { roomId: id, code: value });
  };

  useEffect(() => {
    const initRoom = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/interviews/room/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API Response:", res.data);
        setJwtToken(res.data.jwt);
        setRole(res.data.role);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    if (id) initRoom();
  }, [id]);

  const startRecording = async () => {
    try {
      alert("🎙️ Recording Started");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) =>
        event.data.size > 0 && recordedChunksRef.current.push(event.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob);
        formData.append("interviewId", id);

        try {
          await axios.post("http://localhost:5000/api/upload/audio", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("Audio uploaded successfully.");
        } catch (error) {
          console.error("Upload failed:", error);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      alert("✅ Recording Stopped & Uploaded");
      mediaRecorderRef.current.stop();
    }
  };

  if (!id || !jwtToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-lg font-semibold text-gray-600">
          Setting up the interview room...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="p-3 bg-gray-100 text-sm flex justify-between items-center border-b">
        <h2 className="font-semibold">Live Interview Room</h2>
        <span className="text-gray-500">{saving ? "Saving..." : "All changes saved"}</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 h-full border-r">
          <JaaSMeeting
            appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
            domain="8x8.vc"
            roomName={id}
            jwt={jwtToken}
            configOverwrite={{
              prejoinPageEnabled: true,
              startWithAudioMuted: true,
              startScreenSharing: false,
              enableEmailInStats: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
              iframeRef.style.border = "0";
              iframeRef.style.background = "#000";
              iframeRef.allow = "camera; microphone; display-capture";
            }}
            onApiReady={(externalApi) => {
              console.log("JaaS API Ready");
              externalApi.addListener("readyToClose", async () => {
                alert("Interview ended");
                try {
                  await axios.patch(
                    `http://localhost:5000/api/interviews/room/${id}/status`,
                    { status: "COMPLETED" },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  console.log("Status updated to COMPLETED");
                } catch (err) {
                  console.error("Status update failed:", err);
                }
              });
            }}
          />
        </div>

        <div className="w-1/3 h-full overflow-auto">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading Editor...</div>}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </Suspense>
        </div>
      </div>

      {role === "INTERVIEWER" && (
        <div className="p-3 bg-gray-50 flex justify-end gap-4 border-t">
          <button
            onClick={startRecording}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Stop + Upload
          </button>
        </div>
      )}
    </div>
  );
}
