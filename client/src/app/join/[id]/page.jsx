// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams } from "next/navigation";
// import { JaaSMeeting } from "@jitsi/react-sdk";
// import axios from "axios";
// import Editor from "@monaco-editor/react";

// export default function JoinInterview() {
//   const { id } = useParams();
//   const [role, setRole] = useState(null);
//   const [jwtToken, setJwtToken] = useState(null);
//   const [code, setCode] = useState("// Start coding here...");
//   const [saving, setSaving] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);

//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : "";

//   // useEffect(() => {
//   //   const handleUnload = async () => {
//   //     try {
//   //       await axios.patch(
//   //         `http://localhost:5000/api/interviews/room/${id}/status`,
//   //         {
//   //           status: "COMPLETED",
//   //         },
//   //         {
//   //           headers: { Authorization: `Bearer ${token}` },
//   //         }
//   //       );
//   //     } catch (err) {
//   //       console.error("Error marking complete:", err);
//   //     }
//   //   };

//   //   window.addEventListener("beforeunload", handleUnload);
//   //   return () => window.removeEventListener("beforeunload", handleUnload);
//   // }, [id]);

//   useEffect(() => {
//     const initRoom = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/interviews/room/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setJwtToken(res.data.jwt);
//         setRole(res.data.role);
//       } catch (err) {
//         console.error("Error fetching room:", err);
//       }
//     };
//     initRoom();
//   }, [id]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!id || !code) return;
//       const token = localStorage.getItem("token");

//       setSaving(true);
//       axios
//         .post(
//           `http://localhost:5000/api/interviews/${id}/save-code`,
//           { code },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         )
//         .then(() => setSaving(false))
//         .catch((err) => {
//           console.error("Code save failed:", err);
//           setSaving(false);
//         });
//     }, 10000); // 10 seconds

//     return () => clearInterval(interval);
//   }, [code, id]);

//   // 🎤 Start recording
//   const startRecording = async () => {
//     try {
//       alert("🎙️ Recording Started");
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       recordedChunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           recordedChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         const blob = new Blob(recordedChunksRef.current, {
//           type: "audio/webm",
//         });
//         const formData = new FormData();
//         formData.append("audio", blob);
//         formData.append("interviewId", id);

//         try {
//           await axios.post("http://localhost:5000/api/upload/audio", formData, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           });
//           console.log("Audio uploaded successfully.");
//         } catch (error) {
//           console.error("Upload failed:", error);
//         }
//       };

//       mediaRecorder.start();
//       mediaRecorderRef.current = mediaRecorder;
//     } catch (error) {
//       console.error("Failed to start recording:", error);
//     }
//   };

//   // 🛑 Stop recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       alert("✅ Recording Stopped & Uploaded");
//       mediaRecorderRef.current.stop();
//     }
//   };

//   return (
//     <>
//       {!id || !jwtToken ? (
//         <p className="text-center mt-10">Setting up the interview room...</p>
//       ) : (
//         <div className="h-screen">
//           <h2 className="text-2xl font-bold mb-4">Live Interview Room</h2>

//           {role === "INTERVIEWER" && (
//             <div className="mb-4 flex gap-4">
//               <button
//                 onClick={startRecording}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
//               >
//                 Start Recording
//               </button>
//               <button
//                 onClick={stopRecording}
//                 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
//               >
//                 Stop + Upload
//               </button>
//             </div>
//           )}

//           <JaaSMeeting
//             appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
//             roomName={id}
//             jwt={jwtToken}
//             configOverwrite={{
//               prejoinPageEnabled: true,
//               startWithAudioMuted: true,
//               startScreenSharing: true,
//               enableEmailInStats: false,
//             }}
//             interfaceConfigOverwrite={{
//               DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
//             }}
//             getIFrameRef={(iframeRef) => {
//               iframeRef.style.height = "100%";
//               iframeRef.style.border = "none";
//               iframeRef.style.background = "black";
//             }}
//             onApiReady={(externalApi) => {
//               externalApi.addListener("readyToClose", async () => {
//                 alert("Interview ended");
//                 await axios.patch(
//                   `http://localhost:5000/api/interviews/room/${id}/status`,
//                   { status: "COMPLETED" },
//                   {
//                     headers: { Authorization: `Bearer ${token}` },
//                   }
//                 );
//               });
//             }}
//           />

//           {/* Code Editor */}

//           <Editor
//             height="100%"
//             width="50%"
//             defaultLanguage="javascript"
//             value={code}
//             onChange={(value) => setCode(value)}
//             theme="vs-dark"
//             options={{ minimap: { enabled: false } }}
//           />
//           <div className="text-right p-2 text-xs text-gray-500">
//             {saving ? "Saving..." : "All changes saved"}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";
import Editor from "@monaco-editor/react";

export default function JoinInterview() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [code, setCode] = useState("// Start coding here...");
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const initRoom = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/interviews/room/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API Response:", res.data); // Debug API response
        setJwtToken(res.data.jwt);
        setRole(res.data.role);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    if (id) initRoom(); // Only run if id exists
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!id || !code) return;
      setSaving(true);
      axios
        .post(
          `http://localhost:5000/api/interviews/${id}/save-code`,
          { code },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => setSaving(false))
        .catch((err) => {
          console.error("Code save failed:", err);
          setSaving(false);
        });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [code, id]);

  const startRecording = async () => {
    try {
      alert("🎙️ Recording Started");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

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
      {/* Header */}
      <header className="p-3 bg-gray-100 text-sm flex justify-between items-center border-b">
        <h2 className="font-semibold">Live Interview Room</h2>
        <span className="text-gray-500">{saving ? "Saving..." : "All changes saved"}</span>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* JaaS Meeting */}
        <div className="w-2/3 h-full border-r">
          <JaaSMeeting
            appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
            domain="8x8.vc" // Ensure this matches your JaaS domain
            roomName={id}
            jwt={jwtToken}
            configOverwrite={{
              prejoinPageEnabled: true,
              startWithAudioMuted: true,
              startScreenSharing: false, // Disable if not needed
              enableEmailInStats: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
              iframeRef.style.border = "0";
              iframeRef.style.background = "#000"; // Black background for visibility
              iframeRef.allow = "camera; microphone; display-capture";
            }}
            onApiReady={(externalApi) => {
              console.log("JaaS API Ready"); // Debug log
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

        {/* Code Editor */}
        <div className="w-1/3 h-full overflow-auto">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true, // Auto-adjust size
            }}
          />
        </div>
      </div>

      {/* Recording Controls (Interviewer Only) */}
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
