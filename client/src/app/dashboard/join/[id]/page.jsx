"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JaaSMeeting } from "@jitsi/react-sdk";
import axios from "axios";

export default function JoinInterview() {
  const { id } = useParams();
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const initRoom = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/interviews/room/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("JWT Token:", res.data.jwt);
        setJwtToken(res.data.jwt);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    initRoom();
  }, [id]);

  return (
    <>
      {(!id || !jwtToken) ? (
        <p className="text-center mt-10">Setting up the interview room...</p>
      ) : (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Live Interview Room</h2>
          <JaaSMeeting
            appId = "vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
            roomName={id}
            jwt={jwtToken}
            configOverwrite={{
              prejoinPageEnabled: true, // Wait room for candidates
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
                    externalApi.executeCommand("approve", event.id); // Approve candidate
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
//   const [roomName, setRoomName] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token"); // Assuming JWT for auth is stored here
//     const initRoom = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/interviews/room/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setJwtToken(res.data.jwt);
//         setRoomName(res.data.roomName);
//       } catch (err) {
//         console.error("Error fetching room:", err);
//         setError("Failed to load room. Check server or ID.");
//       }
//     };
//     initRoom();
//   }, [id]);

//   if (!id) {
//     return <p className="text-center mt-10">Setting up the interview room...</p>;
//   }
//   if (error) {
//     return <p className="text-center mt-10 text-red-500">{error}</p>;
//   }
//   if (!jwtToken || !roomName) {
//     return <p className="text-center mt-10">Loading Jitsi...</p>;
//   }

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Live Interview Room</h2>
//       <JaaSMeeting
//         // appId="vpaas-magic-cookie-0d902d80a4824b22bc588f40f4dd5929"
//         roomName={roomName}
//         jwt={jwtToken}
//         configOverwrite={{
//           prejoinPageEnabled: true,
//           startWithAudioMuted: true,
//           startScreenSharing: false,
//         }}
//         interfaceConfigOverwrite={{
//           DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
//         }}
//         getIFrameRef={(iframeRef) => {
//           iframeRef.style.height = "600px";
//           iframeRef.style.width = "100%";
//         }}
//         onApiReady={(externalApi) => {
//           console.log("Jitsi API ready:", externalApi);
//         }}
//       />
//     </div>
//   );
// }