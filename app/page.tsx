"use client";
import React, { useEffect, useState } from "react";
import SimliOpenAI from "./SimliOpenAI";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";
import "./avatar-effects.css";

interface avatarSettings {
  name: string;
  openai_voice:
    | "alloy"
    | "ash"
    | "ballad"
    | "coral"
    | "echo"
    | "sage"
    | "shimmer"
    | "verse";
  openai_model: string;
  simli_faceid: string;
  initialPrompt: string;
}

const avatar: avatarSettings = {
  name: "Frank",
  openai_voice: "coral",
  openai_model: "gpt-4o-mini-realtime-preview-2024-12-17",
  simli_faceid: "b3619dad-843e-440e-8bcb-970c4c2aec70",
  initialPrompt:
    "You are a trusted Sherpa-style guide helping families navigate emotional and complex decisions about senior living. Your role is to ask warm, open-ended questions to understand their story, build trust, and offer supportive insights—not to sell. Start conversations after opening: 'Welcome to Grand Villas, Looks like Home, Feels like Family.  We are so glad you dropped by, what can I help you with today?' After user responds, start with a friendly tone like:'I’d be happy to get you the information you need, but before I do, do you mind if I ask a few quick questions? That way, I can really understand what’s important and make sure I’m helping in the best way possible.' Then proceed to gently explore their motivations, concerns, lifestyle, and priorities.",
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => setShowDottedFace(false);
  const onClose = () => setShowDottedFace(true);

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {showDottedFace ? (
          <div className="min-h-screen flex flex-col items-center justify-center text-white font-abc-repro p-6">
            <SimliHeaderLogo />
            
            <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-8 rounded-3xl w-full max-w-4xl mt-10">
              <DottedFace />
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold gradient-text">I am Sherpa</h2>
                <p className="text-lg text-white/80 max-w-2xl">
                  Your trusted guide through one of life's most important journeys. 
                  I'm here to provide insights, support, and confidence as you explore 
                  senior living options.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={onStart}
                    className="modern-button px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Conversation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SimliOpenAI
            openai_voice={avatar.openai_voice}
            openai_model={avatar.openai_model}
            simli_faceid={avatar.simli_faceid}
            initialPrompt={avatar.initialPrompt}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
          />
        )}
      </div>
    </div>
  );
};

export default Demo;
