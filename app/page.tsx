"use client";
import React, { useEffect, useState } from "react";
import SimliOpenAI from "./SimliOpenAI";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

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
    "You are a trusted Sherpa-style guide helping families navigate emotional and complex decisions about senior living. Your role is to ask warm, open-ended questions to understand their story, build trust, and offer supportive insights—not to sell. Start conversations with a friendly tone like:'I’d be happy to get you the information you need, but before I do, do you mind if I ask a few quick questions? That way, I can really understand what’s important and make sure I’m helping in the best way possible.' Then proceed to gently explore their motivations, concerns, lifestyle, and priorities.",
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => setShowDottedFace(false);
  const onClose = () => setShowDottedFace(true);

  return (
    <div className="bg-black min-h-screen w-full flex flex-col items-center text-white font-abc-repro p-6">
      <SimliHeaderLogo />

      <div className="absolute top-8 right-8">
        {/* Optional GitHub link */}
        {/* 
        <span
          onClick={() => window.open("https://github.com/simliai/create-simli-app-openai")}
          className="cursor-pointer font-semibold text-base hover:underline"
        >
          <Image className="w-[20px] inline mr-2" src={GitHubLogo} alt="GitHub" />
          create-simli-app
        </span>
        */}
      </div>

      <div className="flex flex-col items-center gap-6 bg-white/10 border border-white/20 shadow-lg backdrop-blur-sm p-8 rounded-2xl w-full max-w-3xl mt-10">
        {showDottedFace && <DottedFace />}
        <SimliOpenAI
          openai_voice={avatar.openai_voice}
          openai_model={avatar.openai_model}
          simli_faceid={avatar.simli_faceid}
          initialPrompt={avatar.initialPrompt}
          onStart={onStart}
          onClose={onClose}
          showDottedFace={showDottedFace}
        />
      </div>

      <div className="mt-10 text-center max-w-sm text-sm">
        <h2 className="text-lg font-bold mb-2">I am Sherpa</h2>
        <ul className="list-disc list-inside space-y-2 text-white/90">
          <li>
            I will guide the family through one of the most important journeys
            of their life.
          </li>
          <li>
            I am ready to provide the insights, support, and confidence you need
            to take the next step.
          </li>
        </ul>
        <p className="mt-4 text-white/70 italic">
          Let’s start a meaningful conversation.
        </p>
      </div>
    </div>
  );
};

export default Demo;
