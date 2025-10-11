import IconSparkleLoader from "@/media/IconSparkleLoader";
import React, { useCallback, useRef, useState } from "react";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import { getMessageUrl } from "@/src/config/api";
import axios from "axios";
import { createDeepgramService, DeepgramService, TranscriptionResult } from "@/src/services/deepgram";

interface SimliOpenAIProps {
  simli_faceid: string;
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
  initialPrompt: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
}

const simliClient = new SimliClient();

const SimliOpenAI: React.FC<SimliOpenAIProps> = ({
  simli_faceid,
  openai_voice,
  openai_model,
  initialPrompt,
  onStart,
  onClose,
  showDottedFace,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userMessage, setUserMessage] = useState("...");

  // Refs for various components and states
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isFirstRun = useRef(true);
  
  // Deepgram service ref
  const deepgramServiceRef = useRef<DeepgramService | null>(null);
  const userIdRef = useRef<string>(`video_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // New refs for managing audio chunk delay
  const audioChunkQueueRef = useRef<Int16Array[]>([]);
  const isProcessingChunkRef = useRef(false);
  const isSpeakingRef = useRef(false);

  /**
   * Initializes the Simli client with the provided configuration.
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        maxSessionLength: 6000, // in seconds
        maxIdleTime: 6000, // in seconds
        videoRef: videoRef.current,
        audioRef: audioRef.current,
        enableConsoleLogs: true,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Sends a text message to the backend and gets a response
   */
  const sendMessageToBackend = useCallback(async (text: string) => {
    try {
      console.log("Sending message to backend:", text);
      const response = await axios.post(getMessageUrl(), {
        text: text,
        userId: userIdRef.current,
        userName: userIdRef.current,
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const lastResponse = response.data[response.data.length - 1];
        const responseText = lastResponse.text || "Sorry, I didn't catch that.";
        
        console.log("Backend response:", responseText);
        return responseText;
      }
      return "Sorry, I didn't get a response.";
    } catch (error: any) {
      console.error("Error sending message to backend:", error);
      throw error;
    }
  }, []);

  /**
   * Converts text to speech using OpenAI TTS API and returns audio buffer
   */
  const textToSpeech = useCallback(async (text: string): Promise<ArrayBuffer> => {
    try {
      console.log("Converting text to speech...");
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: openai_voice,
          input: text,
          response_format: 'pcm',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log("Text-to-speech conversion complete");
      return audioBuffer;
    } catch (error: any) {
      console.error("Error in text-to-speech:", error);
      throw error;
    }
  }, [openai_voice]);

  /**
   * Processes the backend response: converts text to speech and sends to Simli
   */
  const processBackendResponse = useCallback(async (responseText: string) => {
    try {
      isSpeakingRef.current = true;
      
      // Get audio from TTS
      const audioBuffer = await textToSpeech(responseText);
      
      // Convert ArrayBuffer to Int16Array (assuming 24000 Hz PCM from OpenAI)
      const audioData = new Int16Array(audioBuffer);
      
      // Downsample from 24000 Hz to 16000 Hz for Simli
      const downsampledAudio = downsampleAudio(audioData, 24000, 16000);
      
      // Split audio into chunks and queue them
      const chunkSize = 4800; // ~300ms chunks at 16000 Hz
      for (let i = 0; i < downsampledAudio.length; i += chunkSize) {
        const chunk = downsampledAudio.slice(i, i + chunkSize);
        audioChunkQueueRef.current.push(chunk);
      }
      
      // Start processing chunks
      if (!isProcessingChunkRef.current) {
        processNextAudioChunk();
      }
      
      isSpeakingRef.current = false;
    } catch (error: any) {
      console.error("Error processing backend response:", error);
      isSpeakingRef.current = false;
    }
  }, [textToSpeech]);

  /**
   * Initializes Deepgram speech recognition for user input
   */
  const initializeSpeechRecognition = useCallback(async () => {
    try {
      console.log("Initializing Deepgram speech recognition...");
      
      // Check if Deepgram API key is available
      const deepgramApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!deepgramApiKey) {
        throw new Error("Deepgram API key not found. Please set NEXT_PUBLIC_DEEPGRAM_API_KEY in your environment variables.");
      }
      
      // Create Deepgram service
      deepgramServiceRef.current = createDeepgramService(
        deepgramApiKey,
        {
          onTranscription: async (result: TranscriptionResult) => {
            console.log("Deepgram transcription:", result);
            
            // Update UI with transcript
            setUserMessage(result.transcript + (result.isFinal ? "" : "..."));
            
            // Only process final results with sufficient confidence
            if (result.isFinal && result.confidence > 0.7) {
              console.log("Processing final transcription:", result.transcript);
              
              // Don't process if avatar is speaking
              if (isSpeakingRef.current) {
                console.log("Avatar is speaking, ignoring user input");
                return;
              }
              
              try {
                // Send to backend
                const responseText = await sendMessageToBackend(result.transcript);
                
                // Process the response
                await processBackendResponse(responseText);
              } catch (error) {
                console.error("Error processing user speech:", error);
                setError("Failed to process your message. Please try again.");
              }
            }
          },
          onError: (error: Error) => {
            console.error("Deepgram error:", error);
            setError(`Speech recognition error: ${error.message}`);
          },
          onConnectionChange: (connected: boolean) => {
            console.log("Deepgram connection status:", connected);
            if (connected) {
              setIsRecording(true);
              setIsAvatarVisible(true);
              
              // Send initial greeting after a short delay
              if (isFirstRun.current) {
                isFirstRun.current = false;
                setTimeout(async () => {
                  const greeting = "Hello! How can I help you today?";
                  await processBackendResponse(greeting);
                }, 1000);
              }
            } else {
              setIsRecording(false);
            }
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
      
      // Start the Deepgram service
      await deepgramServiceRef.current.start();
      console.log("Deepgram speech recognition started");
      
    } catch (error: any) {
      console.error("Error initializing Deepgram speech recognition:", error);
      setError(`Failed to initialize speech recognition: ${error.message}`);
    }
  }, [sendMessageToBackend, processBackendResponse]);

  /**
   * Processes the next audio chunk in the queue.
   */
  const processNextAudioChunk = useCallback(() => {
    if (
      audioChunkQueueRef.current.length > 0 &&
      !isProcessingChunkRef.current
    ) {
      isProcessingChunkRef.current = true;
      const audioChunk = audioChunkQueueRef.current.shift();
      if (audioChunk) {
        const chunkDurationMs = (audioChunk.length / 16000) * 1000; // Calculate chunk duration in milliseconds

        // Send audio chunks to Simli immediately
        simliClient?.sendAudioData(audioChunk as any);
        console.log(
          "Sent audio chunk to Simli:",
          chunkDurationMs,
          "Duration:",
          chunkDurationMs.toFixed(2),
          "ms"
        );
        isProcessingChunkRef.current = false;
        processNextAudioChunk();
      }
    }
  }, []);


  /**
   * Applies a simple low-pass filter to prevent aliasing of audio
   */
  const applyLowPassFilter = (
    data: Int16Array,
    cutoffFreq: number,
    sampleRate: number
  ): Int16Array => {
    // Simple FIR filter coefficients
    const numberOfTaps = 31; // Should be odd
    const coefficients = new Float32Array(numberOfTaps);
    const fc = cutoffFreq / sampleRate;
    const middle = (numberOfTaps - 1) / 2;

    // Generate windowed sinc filter
    for (let i = 0; i < numberOfTaps; i++) {
      if (i === middle) {
        coefficients[i] = 2 * Math.PI * fc;
      } else {
        const x = 2 * Math.PI * fc * (i - middle);
        coefficients[i] = Math.sin(x) / (i - middle);
      }
      // Apply Hamming window
      coefficients[i] *=
        0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (numberOfTaps - 1));
    }

    // Normalize coefficients
    const sum = coefficients.reduce((acc, val) => acc + val, 0);
    coefficients.forEach((_, i) => (coefficients[i] /= sum));

    // Apply filter
    const result = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < numberOfTaps; j++) {
        const idx = i - j + middle;
        if (idx >= 0 && idx < data.length) {
          sum += coefficients[j] * data[idx];
        }
      }
      result[i] = Math.round(sum);
    }

    return result;
  };

  /**
   * Downsamples audio data from one sample rate to another using linear interpolation
   * and anti-aliasing filter.
   *
   * @param audioData - Input audio data as Int16Array
   * @param inputSampleRate - Original sampling rate in Hz
   * @param outputSampleRate - Target sampling rate in Hz
   * @returns Downsampled audio data as Int16Array
   */
  const downsampleAudio = (
    audioData: Int16Array,
    inputSampleRate: number,
    outputSampleRate: number
  ): Int16Array => {
    if (inputSampleRate === outputSampleRate) {
      return audioData;
    }

    if (inputSampleRate < outputSampleRate) {
      throw new Error("Upsampling is not supported");
    }

    // Apply low-pass filter to prevent aliasing
    // Cut off at slightly less than the Nyquist frequency of the target sample rate
    const filteredData = applyLowPassFilter(
      audioData,
      outputSampleRate * 0.45, // Slight margin below Nyquist frequency
      inputSampleRate
    );

    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.floor(audioData.length / ratio);
    const result = new Int16Array(newLength);

    // Linear interpolation
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;

      if (index + 1 < filteredData.length) {
        const a = filteredData[index];
        const b = filteredData[index + 1];
        result[i] = Math.round(a + fraction * (b - a));
      } else {
        result[i] = filteredData[index];
      }
    }

    return result;
  };

  /**
   * Requests microphone permissions for speech recognition.
   */
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log("Requesting microphone permission...");
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log("Microphone permission granted");
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Error accessing microphone. Please check your permissions.");
      return false;
    }
  }, []);

  /**
   * Stops speech recognition and releases microphone
   */
  const stopRecording = useCallback(async () => {
    if (deepgramServiceRef.current) {
      try {
        await deepgramServiceRef.current.stop();
        deepgramServiceRef.current = null;
      } catch (err) {
        console.log("Error stopping Deepgram service:", err);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    console.log("Speech recognition stopped");
  }, []);

  /**
   * Handles the start of the interaction, initializing clients and starting recording.
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();

    try {
      console.log("Starting...");
      
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error("Microphone permission denied");
      }
      
      initializeSimliClient();
      await simliClient?.start();
      eventListenerSimli();
    } catch (error: any) {
      console.error("Error starting interaction:", error);
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [onStart, requestMicrophonePermission]);

  /**
   * Handles stopping the interaction, cleaning up resources and resetting states.
   */
  const handleStop = useCallback(() => {
    console.log("Stopping interaction...");
    setIsLoading(false);
    setError("");
    stopRecording();
    setIsAvatarVisible(false);
    simliClient?.close();
    if (audioContextRef.current) {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
    // Clear audio chunk queue
    audioChunkQueueRef.current = [];
    isProcessingChunkRef.current = false;
    isSpeakingRef.current = false;
    onClose();
    console.log("Interaction stopped");
  }, [stopRecording, onClose]);

  /**
   * Simli Event listeners
   */
  const eventListenerSimli = useCallback(() => {
    if (simliClient) {
      simliClient?.on("connected", async () => {
        console.log("SimliClient connected");
        setIsAvatarVisible(true);
        setIsLoading(false);
        // Initialize speech recognition
        await initializeSpeechRecognition();
      });

      simliClient?.on("disconnected", () => {
        console.log("SimliClient disconnected");
        stopRecording();
        if (audioContextRef.current) {
          audioContextRef.current?.close();
        }
      });
    }
  }, [initializeSpeechRecognition, stopRecording]);

  return (
    <>
      <div
        className={`transition-all duration-300 ${
          showDottedFace ? "h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
      <div className="flex flex-col items-center">
        {!isAvatarVisible ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold w-[164px]">
                Start
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={handleStop}
                className={cn(
                  "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
                )}
              >
                <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                  Stop
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SimliOpenAI;
