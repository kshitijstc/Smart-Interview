"use client";
import {use,useEffect,useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { BACKEND_URL } from "@/lib/constants";

export default function CandidateDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [now, setNow] = useState(dayjs());

  useEffect(() => {

    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem("token");
        // console.log("Token:", token);
        const res = await axios.get(`${BACKEND_URL}/api/interviews/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInterviews(res.data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    };
    fetchInterviews();
  }, []);

  const isJoinAvailable = (scheduledAt) => {
    const now = dayjs();
    const scheduled = dayjs(scheduledAt);
    return (
      now.isAfter(scheduled.subtract(10, "minute")) &&
      now.isBefore(scheduled.add(10, "minute"))
    );
  };
  const upcoming = interviews.filter((i) => i.status === "SCHEDULED");
  const past = interviews.filter((i) => i.status !== "SCHEDULED");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming interviews</p>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((i) => (
              <div
                key={i.id}
                className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    Interviewer: {i.interviewer.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Scheduled At:{" "}
                    {dayjs(i.scheduledAt).format("MMM D, YYYY h:mm A")}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Status: {i.status}
                  </p>
                </div>
                {/* {isJoinAvailable(i.scheduledAt) && ( */}
                
                  <a
                    href={`/join/${i.room.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Join Now
                  </a>
                {/* )} */}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Past Interviews</h2>
        {past.length === 0 ? (
          <p className="text-gray-500">No past interviews yet</p>
        ) : (
          <div className="grid gap-4">
            {past.map((i) => (
              <div
                key={i.id}
                className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row justify-between items-start"
              >
                <div>
                  <p className="font-medium">
                    Interviewer: {i.interviewer.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed At:{" "}
                    {dayjs(i.scheduledAt).format("MMM D, YYYY h:mm A")}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Status: {i.status}
                  </p>
                </div>
                <a
                  href={`/dashboard/interviewer/evaluation/${i.room.link}`}
                  className="mt-4 md:mt-0 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  View Evaluation
                </a>
                {i.evaluation && (
                  <details className="mt-3 md:mt-0 bg-gray-100 p-3 rounded w-full md:w-1/2">
                    <summary className="cursor-pointer text-sm font-semibold mb-2">
                      View Feedback
                    </summary>
                    <div className="text-sm mt-2">
                      <p>
                        <strong>Remarks:</strong> {i.evaluation.remarks}
                      </p>
                      <p>
                        <strong>Score:</strong> {i.evaluation.score}
                      </p>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
