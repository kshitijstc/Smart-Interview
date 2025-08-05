"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import socket from "@/lib/socket";
import { BACKEND_URL } from "@/lib/constants";
import useSpeechToText from "react-hook-speech-to-text";

const Editor = lazy(() => import("@monaco-editor/react"));

export default function JoinInterviewClient() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [isJaaSLoaded, setIsJaaSLoaded] = useState(false);
  const [code, setCode] = useState("// Start coding here...");
  const [transcript, setTranscript] = useState("");
  const editorRef = useRef(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

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

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (editorRef.current) {
      monaco.editor.setModelLanguage(editorRef.current.getModel(), newLanguage);
    }
  };

  // React Hook Speech-to-Text
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results.length > 0) {
      const fullTranscript = results.map((r) => r.transcript).join(" ");
      setTranscript(fullTranscript);
    }
  }, [results]);

  const toggleSpeechToText = () => {
    if (error) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
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
              onClick={toggleSpeechToText}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isRecording ? "🛑 Stop" : "🎙️ Start"} Speech-to-Text
            </button>

            {transcript && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${BACKEND_URL}/api/interviews/${id}/save-transcript`,
                        { transcript },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      alert(
                        "✅ Transcript saved to database! You can now use it in the evaluation page."
                      );
                    } catch (error) {
                      console.error("Failed to save transcript:", error);
                      alert(
                        "❌ Failed to save transcript. Please try again."
                      );
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  💾 Save Transcript
                </button>
                <div className="text-sm text-gray-600 max-w-xs truncate">
                  Transcript:{" "}
                  {transcript.length > 50
                    ? transcript.substring(0, 50) + "..."
                    : transcript}
                </div>
              </>
            )}

            {interimResult && isRecording && (
              <div className="text-sm text-blue-600 max-w-xs truncate italic">
                Interim: {interimResult}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 max-w-xs">
                Error: {error.message || "Speech recognition failed"}
              </div>
            )}
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
              setIsJaaSLoaded(true);
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
          {isJaaSLoaded ? (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  Loading Editor...
                </div>
              }
            >
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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Waiting for video setup...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
