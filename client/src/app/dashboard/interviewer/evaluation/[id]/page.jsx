


"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {Brain,Mic,UserCheck,ClipboardList, } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

export default function EvaluationPage() {
  const { id } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [interviewerResponse, setInterviewerResponse] = useState("");
  const [candidateSummary, setCandidateSummary] = useState("");
  const [interviewerFeedback, setInterviewerFeedback] = useState("");
  const [transcript, setTranscript] = useState("");

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const triggerEvaluation = async (step) => {
    try {
      const payload = { roomId: id, step };
      console.log("Sending evaluation request:", payload);
      console.log("Room ID:", id);
      await axios.post(`${BACKEND_URL}/api/evaluate/${step}`,payload);
      alert(`${step} evaluation queued!`);
      fetchEvaluation(); // Refresh evaluation after queuing
    } catch (error) {
      console.error("Error triggering evaluation:", error.response?.data || error.message);
    }
  };

  const submitInterviewerInput = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/evaluate`, {
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
      const res = await axios.get(`${BACKEND_URL}/api/evaluate/${id}?showAI=true`);
      setEvaluation(res.data);
      // Set transcript from database
      if (res.data.transcript) {
        setTranscript(res.data.transcript);
      }
    } catch (error) {
      console.error("Error fetching evaluation:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  },[id]);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Interview Evaluation Report</h1>
      
      

      {decoded?.role === "INTERVIEWER" && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎛️ Controls</h2>
          <div className="space-y-4">
            {transcript ? (
              <div>
                
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-800 max-h-32 overflow-y-auto">
                  {transcript}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Character count: {transcript.length}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No transcript found. Please record the candidate's explanation in the interview room first.
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => triggerEvaluation("ai")}
                // disabled={!transcript}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Evaluate Code (AI)
              </button>
            </div>
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
      {evaluation ? (
        <div className="space-y-6">
          {/* AI Evaluation - Only visible to INTERVIEWER */}
          {evaluation.ai && decoded?.role === "INTERVIEWER" && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                <Brain className="text-blue-500" /> AI Code Evaluation
              </div>
              <p className="text-gray-700 whitespace-pre-line">{evaluation.ai}</p>
            </div>
          )}

          {/* Interviewer Feedback - Visible to both INTERVIEWER and CANDIDATE */}
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

          
        </div>
      ):(
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-700">No evaluation data available.</p>
        </div>
      )}
    </div>
  );
}