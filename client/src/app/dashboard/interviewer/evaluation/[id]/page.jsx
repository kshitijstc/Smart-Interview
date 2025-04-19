"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {Brain,Mic,UserCheck,ClipboardList, } from "lucide-react";

export default function EvaluationPage() {
  const { id } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [interviewerResponse, setInterviewerResponse] = useState("");
  const [candidateSummary, setCandidateSummary] = useState("");
  const [interviewerFeedback, setInterviewerFeedback] = useState("");

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const triggerEvaluation = async (step) => {
    try {
      await axios.post(`http://localhost:5000/api/evaluate/${step}`, { roomId: id, step });
      alert(`${step} evaluation queued!`);
      fetchEvaluation(); // Refresh evaluation after queuing
    } catch (error) {
      console.error("Error triggering evaluation:", error.response?.data || error.message);
    }
  };

  const submitInterviewerInput = async () => {
    try {
      await axios.post("http://localhost:5000/api/evaluate", {
        roomId: id,
        interviewerResponse,
        candidateSummary,
        interviewerFeedback,
        step: "interviewer",
      });
      alert("Interviewer input saved!");
      setInterviewerResponse("");
      setCandidateSummary("");
      setInterviewerFeedback("");
      fetchEvaluation(); // Refresh evaluation
    } catch (error) {
      console.error("Error submitting feedback:", error.response?.data || error.message);
    }
  };

  const fetchEvaluation = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/evaluate/${id}?showAI=true`);
      setEvaluation(res.data);
    } catch (error) {
      console.error("Error fetching evaluation:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Interview Evaluation Report</h1>

      {decoded?.role === "INTERVIEWER" && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎛️ Controls</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => triggerEvaluation("ai")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Evaluate Code (AI)
            </button>
            <button
              onClick={() => triggerEvaluation("audio")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Evaluate Audio (AI)
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="number"
              placeholder="Score (0-100)"
              value={interviewerResponse}
              onChange={(e) => setInterviewerResponse(e.target.value)}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
            />
            <textarea
              placeholder="Candidate Summary"
              value={candidateSummary}
              onChange={(e) => setCandidateSummary(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <textarea
              placeholder="Interviewer Feedback"
              value={interviewerFeedback}
              onChange={(e) => setInterviewerFeedback(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <button
              onClick={submitInterviewerInput}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Submit Input
            </button>
          </div>
        </div>
      )}

      {evaluation && (
        <div className="space-y-6">
          {evaluation.ai && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                <Brain className="text-blue-500" /> AI Code Evaluation
              </div>
              <p className="text-gray-700 whitespace-pre-line">{evaluation.ai}</p>
            </div>
          )}

          {evaluation.audio && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                <Mic className="text-green-500" /> Audio Evaluation
              </div>
              <p className="text-gray-700 whitespace-pre-line">{evaluation.audio}</p>
            </div>
          )}

          {evaluation.interviewer && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                <UserCheck className="text-purple-500" /> Interviewer Feedback
              </div>
              <p><strong>Score:</strong> {evaluation.interviewer.response}</p>
              <p><strong>Summary:</strong> {evaluation.interviewer.summary}</p>
              <p><strong>Feedback:</strong> {evaluation.interviewer.feedback}</p>
              <p className="text-sm text-gray-500 mt-2"><strong>Time:</strong> {evaluation.interviewer.timestamp}</p>
            </div>
          )}

          {evaluation.final && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                <ClipboardList className="text-orange-500" /> Final Evaluation
              </div>
              <p className="text-gray-700 whitespace-pre-line">{evaluation.final}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}