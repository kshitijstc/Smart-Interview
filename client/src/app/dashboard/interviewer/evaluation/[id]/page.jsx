"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Evaluation for Interview</h1>
      {decoded?.role === "INTERVIEWER" && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => triggerEvaluation("ai")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Evaluate Code using AI
            </button>
            <button
              onClick={() => triggerEvaluation("audio")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Evaluate Audio using AI
            </button>
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Interviewer Score (0-100)"
              value={interviewerResponse}
              onChange={(e) => setInterviewerResponse(e.target.value)}
              className="p-1 border rounded mr-2"
              min="0"
              max="100"
            />
            <textarea
              placeholder="Candidate Summary"
              value={candidateSummary}
              onChange={(e) => setCandidateSummary(e.target.value)}
              className="p-1 border rounded mr-2 mt-2 w-1/2"
            />
            <textarea
              placeholder="Interviewer Feedback"
              value={interviewerFeedback}
              onChange={(e) => setInterviewerFeedback(e.target.value)}
              className="p-1 border rounded mt-2 w-1/2"
            />
            <button
              onClick={submitInterviewerInput}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-2"
            >
              Submit Input
            </button>
          </div>
        </div>
      )}
      {evaluation && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Evaluation Results:</h2>
          {evaluation.ai && (
            <div className="mt-2">
              <h3 className="font-medium">AI Evaluation:</h3>
              <p>{evaluation.ai}</p>
            </div>
          )}
          {evaluation.audio && (
            <div className="mt-2">
              <h3 className="font-medium">Audio Evaluation:</h3>
              <p>{evaluation.audio}</p>
            </div>
          )}
          {evaluation.interviewer && (
            <div className="mt-2">
              <h3 className="font-medium">Interviewer Input:</h3>
              <p>Score: {evaluation.interviewer.response}</p>
              <p>Summary: {evaluation.interviewer.summary}</p>
              <p>Feedback: {evaluation.interviewer.feedback}</p>
              <p>Time: {evaluation.interviewer.timestamp}</p>
            </div>
          )}
          {evaluation.final && (
            <div className="mt-2">
              <h3 className="font-medium">Final Evaluation:</h3>
              <p>{evaluation.final}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}