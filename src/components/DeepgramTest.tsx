/**
 * Deepgram Integration Test Component
 * 
 * This component provides a simple test interface to validate Deepgram functionality
 * independently of the main SimliOpenAI component.
 */

import React, { useState, useRef } from 'react';
import { createDeepgramService, DeepgramService, TranscriptionResult } from '../services/deepgram';

interface DeepgramTestProps {
  apiKey: string;
}

const DeepgramTest: React.FC<DeepgramTestProps> = ({ apiKey }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [error, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  
  const deepgramServiceRef = useRef<DeepgramService | null>(null);

  const handleStart = async () => {
    try {
      setError('');
      setTranscriptions([]);
      
      deepgramServiceRef.current = createDeepgramService(
        apiKey,
        {
          onTranscription: (result: TranscriptionResult) => {
            console.log('Test transcription:', result);
            setTranscriptions(prev => [...prev, result]);
          },
          onError: (error: Error) => {
            console.error('Test error:', error);
            setError(error.message);
          },
          onConnectionChange: (connected: boolean) => {
            console.log('Test connection status:', connected);
            setConnectionStatus(connected);
            setIsRecording(connected);
          },
        },
        {
          model: 'nova-2',
          language: 'en-US',
          sampleRate: 16000,
          channels: 1,
          encoding: 'linear16',
        }
      );

      await deepgramServiceRef.current.start();
    } catch (error: any) {
      setError(`Failed to start: ${error.message}`);
    }
  };

  const handleStop = async () => {
    try {
      if (deepgramServiceRef.current) {
        await deepgramServiceRef.current.stop();
        deepgramServiceRef.current = null;
      }
      setIsRecording(false);
      setConnectionStatus(false);
    } catch (error: any) {
      setError(`Failed to stop: ${error.message}`);
    }
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Deepgram Integration Test</h2>
      
      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Connection: {connectionStatus ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
          <span>Recording: {isRecording ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={handleStart}
          disabled={isRecording}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Recording
        </button>
        <button
          onClick={handleStop}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Stop Recording
        </button>
        <button
          onClick={clearTranscriptions}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear Results
        </button>
        <button
          onClick={() => deepgramServiceRef.current?.finishUtterance()}
          disabled={!isRecording}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Finish Utterance
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click "Start Recording" and speak into your microphone. 
          You should see transcription results appear below in real-time. If no results appear, 
          try clicking "Finish Utterance" after speaking to force final transcription.
        </p>
      </div>

      {/* Transcription Results */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Transcription Results:</h3>
        {transcriptions.length === 0 ? (
          <p className="text-gray-500 italic">No transcriptions yet...</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transcriptions.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.isFinal 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    result.isFinal ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.isFinal ? 'Final' : 'Interim'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-800">{result.transcript}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {transcriptions.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-semibold mb-2">Statistics:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Transcriptions:</span> {transcriptions.length}
            </div>
            <div>
              <span className="font-medium">Final Results:</span> {transcriptions.filter(t => t.isFinal).length}
            </div>
            <div>
              <span className="font-medium">Average Confidence:</span> {
                transcriptions.length > 0 
                  ? (transcriptions.reduce((sum, t) => sum + t.confidence, 0) / transcriptions.length * 100).toFixed(1)
                  : '0'
              }%
            </div>
            <div>
              <span className="font-medium">High Confidence (&gt;80%):</span> {
                transcriptions.filter(t => t.confidence > 0.8).length
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepgramTest;
