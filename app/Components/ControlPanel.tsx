import React from 'react';
import IconSparkleLoader from "@/media/IconSparkleLoader";
import cn from '../utils/TailwindMergeAndClsx';

interface ControlPanelProps {
  isAvatarVisible: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isAvatarVisible,
  isLoading,
  onStart,
  onStop,
  error,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">!</span>
            </div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {!isAvatarVisible ? (
          <button
            onClick={onStart}
            disabled={isLoading}
            className={cn(
              "group relative w-full max-w-sm h-16 px-8 rounded-2xl transition-all duration-300 modern-button",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
              "disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed",
              "shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100",
              "border border-white/20 hover:border-white/40"
            )}
          >
            <div className="flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <IconSparkleLoader className="h-6 w-6 animate-loader text-white" />
                  <span className="text-white font-semibold text-lg">Starting...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-white font-semibold text-lg">Start Conversation</span>
                </>
              )}
            </div>
            
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
            <button
              onClick={onStop}
              className={cn(
                "group relative w-full sm:w-auto px-8 py-4 rounded-2xl transition-all duration-300 modern-button",
                "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500",
                "shadow-lg hover:shadow-xl transform hover:scale-105",
                "border border-red-400/20 hover:border-red-400/40"
              )}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <span className="text-white font-semibold">End Conversation</span>
              </div>
              
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* Status Information */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-400">
          {!isAvatarVisible ? (
            "Click to start your AI conversation"
          ) : (
            "AI Avatar is active and ready to chat"
          )}
        </div>
        
        {/* Feature Badges */}
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span>Voice Recognition</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>AI Response</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span>Voice Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
