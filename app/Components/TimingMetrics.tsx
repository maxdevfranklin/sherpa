import React from 'react';
import cn from '../utils/TailwindMergeAndClsx';

interface TimingMetricsProps {
  timings: {
    speechToText: number;
    backendResponse: number;
    textToSpeech: number;
    total: number;
  };
  isProcessing: boolean;
  processingStep: string;
  isRecording: boolean;
}

const TimingMetrics: React.FC<TimingMetricsProps> = ({
  timings,
  isProcessing,
  processingStep,
  isRecording,
}) => {
  const formatTime = (ms: number) => {
    if (ms === 0) return '--';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (ms: number) => {
    if (ms === 0) return 'text-gray-400';
    if (ms < 500) return 'text-green-400';
    if (ms < 1000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 font-medium">{processingStep}</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && !isProcessing && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-medium">Listening...</span>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Speech to Text */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-xl p-4 border border-indigo-500/20 backdrop-blur-sm metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <span className="text-sm font-medium text-indigo-300">Speech → Text</span>
          </div>
          <div className={cn("text-xl font-bold", getStatusColor(timings.speechToText))}>
            {formatTime(timings.speechToText)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Deepgram</div>
        </div>

        {/* Backend Response */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl p-4 border border-emerald-500/20 backdrop-blur-sm metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-sm font-medium text-emerald-300">Backend</span>
          </div>
          <div className={cn("text-xl font-bold", getStatusColor(timings.backendResponse))}>
            {formatTime(timings.backendResponse)}
          </div>
          <div className="text-xs text-gray-400 mt-1">AI Processing</div>
        </div>

        {/* Text to Speech */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/20 backdrop-blur-sm metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm font-medium text-purple-300">Text → Voice</span>
          </div>
          <div className={cn("text-xl font-bold", getStatusColor(timings.textToSpeech))}>
            {formatTime(timings.textToSpeech)}
          </div>
          <div className="text-xs text-gray-400 mt-1">OpenAI TTS</div>
        </div>

        {/* Total Time */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-xl p-4 border border-orange-500/20 backdrop-blur-sm metric-card">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-sm font-medium text-orange-300">Total</span>
          </div>
          <div className={cn("text-xl font-bold", getStatusColor(timings.total))}>
            {formatTime(timings.total)}
          </div>
          <div className="text-xs text-gray-400 mt-1">End-to-End</div>
        </div>
      </div>

      {/* Performance Summary */}
      {timings.total > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Performance</span>
            <span className={cn("font-medium", 
              timings.total < 1000 ? "text-green-400" : 
              timings.total < 2000 ? "text-yellow-400" : "text-red-400"
            )}>
              {timings.total < 1000 ? "Excellent" : 
               timings.total < 2000 ? "Good" : "Needs Improvement"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimingMetrics;
