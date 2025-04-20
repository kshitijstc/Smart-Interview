"use client";
import {useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dayjs from "dayjs";
import { BACKEND_URL } from "@/lib/constants";

export default function CandidateDashboard() {
  const [stats, useStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    noShows: 0,
  });
  const [interviews, setInterviews] = useState([]);
  const router = useRouter();
  const [now, setNow] = useState(dayjs());

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BACKEND_URL}/api/interviews/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      useStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

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

  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, []);

  const isJoinAvailable = (scheduledAt) => {
    const now = dayjs();
    const scheduled = dayjs(scheduledAt);
    return (
      now.isAfter(scheduled.subtract(10, "minute")) &&
      now.isBefore(scheduled.add(10, "minute"))
    );
  };

  const statCards = [
    { label: "Total Interviews", value: stats.total },
    { label: "Completed", value: stats.completed },
    { label: "Scheduled", value: stats.scheduled },
    { label: "No-shows", value: stats.noShows },
  ];

  const upcoming = interviews.filter((i) => i.status === "SCHEDULED");
  const past = interviews.filter((i) => i.status !== "SCHEDULED");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Overview of your interview statistics.
      </p>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <section className="mt-12 mb-10">
        <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming interviews</p>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((i) => (
              <div
                key={i.id}
                className="p-4  rounded-lg shadow-sm hover:shadow-md bg-white flex flex-col md:flex-row justify-between items-center"
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
                className="p-4 hover:shadow-md rounded-lg shadow-sm bg-white flex flex-col md:flex-row justify-between items-start"
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
