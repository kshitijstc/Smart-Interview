"use client";

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";

export default function JoinInterview() {
  const { id } = useParams();
  const [jwtToken, setJwtToken] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🧠 Fetch Jitsi Room JWT
  useEffect(() => {
    const initRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/interviews/room/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJwtToken(res.data.jwt);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    initRoom();
  }, [id]);

  // 🎤 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
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

  // 🛑 Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      {(!id || !jwtToken) ? (
        <p className="text-center mt-10">Setting up the interview room...</p>
      ) : (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Live Interview Room</h2>

          <div className="mb-4 flex gap-4">
            <button
              onClick={startRecording}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Start Recording
            </button>
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Stop + Upload
            </button>
          </div>

          <JaaSMeeting
            appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
            roomName={id}
            jwt={jwtToken}
            configOverwrite={{
              prejoinPageEnabled: true,
              startWithAudioMuted: true,
              startScreenSharing: true,
              enableEmailInStats: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "600px";
            }}
            onApiReady={(externalApi) => {
              if (jwtToken.includes("moderator")) {
                externalApi.on("participantRoleChanged", (event) => {
                  if (event.role === "CANDIDATE") {
                    externalApi.executeCommand("approve", event.id);
                  }
                });
              }
            }}
          />
        </div>
      )}
    </>
  );
}





// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { JaaSMeeting } from "@jitsi/react-sdk";
// import axios from "axios";

// export default function JoinInterview() {
//   const { id } = useParams();
//   const [jwtToken, setJwtToken] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const initRoom = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/interviews/room/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         console.log("JWT Token:", res.data.jwt);
//         setJwtToken(res.data.jwt);
//       } catch (err) {
//         console.error("Error fetching room:", err);
//       }
//     };
//     initRoom();
//   }, [id]);

//   return (
//     <>
//       {(!id || !jwtToken) ? (
//         <p className="text-center mt-10">Setting up the interview room...</p>
//       ) : (
//         <div className="p-4">
//           <h2 className="text-2xl font-bold mb-4">Live Interview Room</h2>
//           <JaaSMeeting
//             appId = "vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
//             roomName={id}
//             jwt={jwtToken}
//             configOverwrite={{
//               prejoinPageEnabled: true, // Wait room for candidates
//               startWithAudioMuted: true,
//               startScreenSharing: true,
//               enableEmailInStats: false,
//             }}
//             interfaceConfigOverwrite={{
//               DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
//             }}
//             getIFrameRef={(iframeRef) => {
//               iframeRef.style.height = "600px";
//             }}
//             onApiReady={(externalApi) => {
//               if (jwtToken.includes("moderator")) {
//                 externalApi.on("participantRoleChanged", (event) => {
//                   if (event.role === "CANDIDATE") {
//                     externalApi.executeCommand("approve", event.id); // Approve candidate
//                   }
//                 });
//               }
//             }}
//           />
//         </div>
//       )}
//     </>
//   );
// }




