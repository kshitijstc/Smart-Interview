"use client";

import { useState, useEffect } from 'react';
import  useSpeechToText  from 'react-hook-speech-to-text';
import { Mic, MicOff, Square } from 'lucide-react';

const SpeechToText = ({ onTranscriptChange, isInterviewer = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const {
    error,
    interimResult,
    isRecording: hookIsRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionApiName: 'webkitSpeechRecognition',
  });

  useEffect(() => {
    if (results.length > 0) {
      const fullTranscript = results.map(result => result.transcript).join(' ');
      setTranscript(fullTranscript);
      onTranscriptChange(fullTranscript);
    }
  }, [results, onTranscriptChange]);

  useEffect(() => {
    if (interimResult) {
      setInterimTranscript(interimResult);
    }
  }, [interimResult]);

  const handleStartRecording = () => {
    setIsRecording(true);
    startSpeechToText();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopSpeechToText();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-600 text-sm">
          Error: {error.message || 'Speech recognition not supported'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎙️ Speech-to-Text
        </h3>
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Recording...
          </div>
        </div>
      )}

      {transcript && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Final Transcript:</h4>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 max-h-32 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}

      {interimTranscript && isRecording && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Interim Transcript:</h4>
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600 italic">
            {interimTranscript}
          </div>
        </div>
      )}

      {!transcript && !isRecording && (
        <div className="text-center text-gray-500 text-sm py-4">
          Click "Start Recording" to begin speech-to-text transcription
        </div>
      )}
    </div>
  );
};

export default SpeechToText; 