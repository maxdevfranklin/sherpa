import React, { useRef } from 'react';
import cn from '../utils/TailwindMergeAndClsx';

interface EnhancedVideoBoxProps {
  video: React.RefObject<HTMLVideoElement>;
  audio: React.RefObject<HTMLAudioElement>;
  isAvatarVisible: boolean;
  isRecording: boolean;
  userMessage: string;
  showDottedFace: boolean;
}

const EnhancedVideoBox: React.FC<EnhancedVideoBoxProps> = ({
  video,
  audio,
  isAvatarVisible,
  isRecording,
  userMessage,
  showDottedFace,
}) => {
  return (
    <div className="relative w-full flex justify-center">
      {/* Video Container with Enhanced Styling */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black",
        "shadow-2xl border-2 transition-all duration-500 avatar-container",
        "aspect-square flex items-center justify-center h-[450px] w-[450px]",
        isAvatarVisible 
          ? "border-blue-500/50 shadow-blue-500/25" 
          : "border-gray-700/50 shadow-gray-500/10",
        showDottedFace ? "h-0 opacity-0" : "h-auto opacity-100"
      )}>
        {/* Video Element */}
        <video
          ref={video}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            isAvatarVisible ? "opacity-100" : "opacity-0"
          )}
          autoPlay
          playsInline
          muted
        />
        
        {/* Audio Element */}
        <audio ref={audio} autoPlay />
        
        {/* Initial State - Show before avatar is visible */}
        {!isAvatarVisible && !showDottedFace && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 text-white">🤖</div>
              </div>
              <div className="text-white font-medium">AI Avatar Ready</div>
              <div className="text-gray-400 text-sm mt-1">Click to start conversation</div>
            </div>
          </div>
        )}
        
        {/* Overlay Effects */}
        {isAvatarVisible && (
          <>
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-500/10 pointer-events-none" />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-300 text-xs font-medium">Recording</span>
              </div>
            )}
            
            {/* User Message Display */}
            {userMessage && userMessage !== "..." && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-green-300 mb-1">You said:</div>
                    <div className="text-white text-xs leading-relaxed">
                      {userMessage}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl -z-10 opacity-50" />
    </div>
  );
};

export default EnhancedVideoBox;
