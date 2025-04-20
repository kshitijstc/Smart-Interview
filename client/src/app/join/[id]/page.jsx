"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";
// import dynamic from "next/dynamic";
import socket from "@/lib/socket";
import { BACKEND_URL } from "@/lib/constants";

// Dynamically import Editor to avoid SSR issues
const Editor = lazy(() => import("@monaco-editor/react"));
// const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function JoinInterview() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("// Start coding here...");
  const [rightWidth, setRightWidth] = useState("35%");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const editorRef = useRef(null);
  const dividerRef = useRef(null);

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
  
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor; // Store editor instance
  };
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (editorRef.current) {
      monaco.editor.setModelLanguage(editorRef.current.getModel(), newLanguage);
    }
  };

  useEffect(() => {
    const initRoom = async () => {
      try {
        const res = await axios.get(  
          `${BACKEND_URL}/api/interviews/room/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
          const res=await axios.post(`${BACKEND_URL}/api/upload/audio`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          const audioUrl = res.data.url;
          console.log("Cloudinary url",res.data.url);
          await axios.post(
            `${BACKEND_URL}/api/interviews/${id}/save-audio-url`,
            { audioUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
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

  // const handleMouseDown = (e) => {
  //   document.addEventListener("mousemove", handleMouseMove);
  //   document.addEventListener("mouseup", handleMouseUp);
  // };

  // const handleMouseMove = (e) => {
  //   const container = document.querySelector(".split-container");
  //   if (!container) return;

  //   const containerWidth = container.offsetWidth;
  //   const newRightWidth = ((containerWidth - e.clientX) / containerWidth) * 100; 
  //   if (newRightWidth > 20 && newRightWidth < 80) { 
  //     setRightWidth(`${newRightWidth}%`);
  //   }
  // };

  // const handleMouseUp = () => {
  //   document.removeEventListener("mousemove", handleMouseMove);
  //   document.removeEventListener("mouseup", handleMouseUp);
  // };

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
      <header className="p-2 bg-gray-100 text-md flex justify-between items-center border-b">
        <h2 className="font-semibold">Live Interview Room</h2>
        
        {role === "INTERVIEWER" && (
        <div className="p-2 flex gap-2">
          <button
            onClick={startRecording}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Stop + Upload
          </button>
        </div>
      )}
        
        <select
          value={language}
          onChange={handleLanguageChange}
          className="p-1 border rounded cursor-pointer"
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/5 h-full border-r">
          <JaaSMeeting
            appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
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
                    `${BACKEND_URL}/api/interviews/room/${id}/status`,
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

        <div className="w-2/5 h-full overflow-auto">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading Editor...</div>}>
            <Editor
              height="100%"
              defaultLanguage={language} // Set default language
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
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
      {/* <div className="split-container flex flex-1 overflow-hidden">
        <div
          className="h-full border-r"
          style={{ width: `calc(100% - ${rightWidth})`, minWidth: "20%", maxWidth: "80%" }}
        >
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
                    `${BACKEND_URL}/api/interviews/room/${id}/status`,
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

        <div
          ref={dividerRef}
          className="w-1.5 bg-gray-400 cursor-col-resize"
          onMouseDown={handleMouseDown}
          style={{ height: "100%" }}
        ></div>

        <div className="w-full h-full overflow-auto" 
        style={{ width: rightWidth, minWidth: "20%", maxWidth: "80%" }}>
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading Editor...</div>}>
            <Editor
              height="100%"
              defaultLanguage={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </Suspense>
        </div>
      </div> */}

      
    </div>
  );
}
