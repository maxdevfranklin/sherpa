/**
 * Deepgram Real-time Transcription Service
 * 
 * This service provides real-time speech-to-text functionality using Deepgram's WebSocket API.
 * It handles audio streaming, transcription, and provides better accuracy than Web Speech API.
 * 
 * Algorithm Overview:
 * 1. Establishes WebSocket connection to Deepgram's real-time transcription endpoint
 * 2. Streams audio data in real-time using MediaRecorder API
 * 3. Processes transcription results with confidence scores
 * 4. Handles connection management and error recovery
 * 
 * Technical Implementation:
 * - Uses WebSocket for low-latency real-time communication
 * - Implements audio chunking for optimal streaming performance
 * - Provides confidence-based result filtering
 * - Includes automatic reconnection and error handling
 */

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export interface DeepgramConfig {
  apiKey: string;
  model?: string;
  language?: string;
  sampleRate?: number;
  channels?: number;
  encoding?: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export interface DeepgramServiceCallbacks {
  onTranscription: (result: TranscriptionResult) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
}

export class DeepgramService {
  private client: any;
  private connection: any = null;
  private isConnected = false;
  private config: DeepgramConfig;
  private callbacks: DeepgramServiceCallbacks;
  private audioStream: MediaStream | null = null;
  private audioContextRef: AudioContext | null = null;
  private processorRef: ScriptProcessorNode | null = null;
  private isRecording = false;
  private audioChunkCount = 0;

  constructor(config: DeepgramConfig, callbacks: DeepgramServiceCallbacks) {
    this.config = {
      model: 'nova-2',
      language: 'en-US',
      sampleRate: 16000,
      channels: 1,
      encoding: 'linear16',
      ...config,
    };
    this.callbacks = callbacks;
    this.client = createClient(config.apiKey);
  }

  /**
   * Initializes the Deepgram connection and starts real-time transcription
   */
  async start(): Promise<void> {
    try {
      console.log('Starting Deepgram service...');
      
      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create WebSocket connection to Deepgram
      this.connection = this.client.listen.live({
        model: this.config.model,
        language: this.config.language,
        sample_rate: this.config.sampleRate,
        channels: this.config.channels,
        encoding: this.config.encoding,
        interim_results: true,
        smart_format: true,
        punctuate: true,
        diarize: false,
        vad_events: true,
        endpointing: 300,
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Set up audio streaming
      this.setupAudioStreaming();

      console.log('Deepgram service started successfully');
    } catch (error) {
      console.error('Failed to start Deepgram service:', error);
      this.callbacks.onError(error as Error);
      throw error;
    }
  }

  /**
   * Sets up event handlers for the Deepgram connection
   */
  private setupEventHandlers(): void {
    // Handle connection open
    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened');
      this.isConnected = true;
      this.callbacks.onConnectionChange(true);
    });

    // Handle transcriptions
    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      try {
        console.log('Raw Deepgram transcript data:', data);
        
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const confidence = data.channel?.alternatives?.[0]?.confidence || 0;
        const isFinal = data.is_final;

        if (transcript && transcript.trim()) {
          const result: TranscriptionResult = {
            transcript: transcript.trim(),
            confidence,
            isFinal,
            timestamp: Date.now(),
          };

          console.log(`Deepgram transcription [${isFinal ? 'FINAL' : 'INTERIM'}]:`, transcript, `(confidence: ${confidence.toFixed(2)})`);
          this.callbacks.onTranscription(result);
        } else {
          console.log('Empty transcript received:', { transcript, isFinal, confidence });
        }
      } catch (error) {
        console.error('Error processing transcription:', error);
      }
    });

    // Handle metadata
    this.connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
      console.log('Deepgram metadata:', data);
    });

    // Handle speech started
    this.connection.on(LiveTranscriptionEvents.SpeechStarted, () => {
      console.log('Speech started');
    });

    // Handle speech ended
    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      console.log('Utterance ended - this should trigger final transcription');
    });

    // Handle errors
    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      console.error('Deepgram error:', error);
      this.callbacks.onError(new Error(`Deepgram error: ${error.message || 'Unknown error'}`));
    });

    // Handle connection close
    this.connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed');
      this.isConnected = false;
      this.callbacks.onConnectionChange(false);
    });
  }

  /**
   * Sets up audio streaming from microphone to Deepgram
   */
  private setupAudioStreaming(): void {
    if (!this.audioStream) {
      throw new Error('Audio stream not available');
    }

    // Create AudioContext for processing raw audio
    this.audioContextRef = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.config.sampleRate,
    });

    // Create audio source from microphone
    const source = this.audioContextRef.createMediaStreamSource(this.audioStream);
    
    // Create ScriptProcessorNode for real-time audio processing
    const bufferSize = 4096;
    this.processorRef = this.audioContextRef.createScriptProcessor(bufferSize, 1, 1);
    
    this.processorRef.onaudioprocess = (event) => {
      if (!this.isConnected || !this.connection) {
        return;
      }

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0); // Get mono audio
      
      // Convert Float32Array to Int16Array (16-bit PCM)
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        // Convert from [-1, 1] to [-32768, 32767]
        pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }
      
      // Send PCM data to Deepgram
      try {
        this.connection.send(pcmData.buffer);
        this.audioChunkCount++;
        if (this.audioChunkCount % 50 === 0) { // Log every 50 chunks (about every 2-3 seconds)
          console.log(`Sent ${this.audioChunkCount} audio chunks to Deepgram`);
        }
      } catch (error) {
        console.error('Error sending audio data to Deepgram:', error);
      }
    };

    // Connect the audio processing chain
    source.connect(this.processorRef);
    this.processorRef.connect(this.audioContextRef.destination);
    
    this.isRecording = true;
    this.audioChunkCount = 0;
    console.log('Audio streaming started with PCM format');
    console.log('AudioContext sample rate:', this.audioContextRef.sampleRate);
    console.log('AudioContext state:', this.audioContextRef.state);
  }

  /**
   * Stops the transcription service and cleans up resources
   */
  async stop(): Promise<void> {
    try {
      console.log('Stopping Deepgram service...');

      // Stop audio processing
      if (this.processorRef) {
        this.processorRef.disconnect();
        this.processorRef = null;
      }

      // Close AudioContext
      if (this.audioContextRef && this.audioContextRef.state !== 'closed') {
        await this.audioContextRef.close();
        this.audioContextRef = null;
      }

      // Stop audio stream
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }

      // Close Deepgram connection
      if (this.connection && this.isConnected) {
        this.connection.finish();
        this.connection = null;
        this.isConnected = false;
        this.callbacks.onConnectionChange(false);
      }

      this.isRecording = false;
      console.log('Deepgram service stopped');
    } catch (error) {
      console.error('Error stopping Deepgram service:', error);
    }
  }

  /**
   * Checks if the service is currently connected and recording
   */
  isActive(): boolean {
    return this.isConnected && this.isRecording;
  }

  /**
   * Gets the current connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Updates the configuration (useful for dynamic language/model changes)
   */
  updateConfig(newConfig: Partial<DeepgramConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Manually triggers utterance end (useful for testing)
   */
  finishUtterance(): void {
    if (this.connection && this.isConnected) {
      console.log('Manually finishing utterance...');
      this.connection.finish();
    }
  }
}

/**
 * Factory function to create a Deepgram service instance
 */
export function createDeepgramService(
  apiKey: string,
  callbacks: DeepgramServiceCallbacks,
  options?: Partial<DeepgramConfig>
): DeepgramService {
  const config: DeepgramConfig = {
    apiKey,
    ...options,
  };

  return new DeepgramService(config, callbacks);
}
