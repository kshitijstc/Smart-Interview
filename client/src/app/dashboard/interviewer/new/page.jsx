"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants";

export default function NewInterview() {
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const router = useRouter();

  // Fetch all candidates on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BACKEND_URL}/api/users/candidates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCandidates(res.data);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
      }
    };

    fetchCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${BACKEND_URL}/api/interviews`,{ candidateId, scheduledAt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/dashboard/interviewer");
    } catch (err) {
      console.error("Error creating interview:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create New Interview</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Candidate</label>
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          >
            <option value="">-- Choose --</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Schedule Interview
        </button>
      </form>
    </div>
  );
}
