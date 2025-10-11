# Deepgram Integration Setup Guide

This guide explains how to set up and use Deepgram for voice-to-text functionality in the Simli application.

## Overview

The application now uses Deepgram's real-time speech recognition API instead of the browser's Web Speech API for improved accuracy and reliability. Deepgram provides:

- **Higher accuracy**: Better speech recognition quality
- **Real-time processing**: Low-latency transcription
- **Confidence scores**: Filter results based on accuracy
- **Better error handling**: More robust connection management

## Algorithm & Technical Implementation

### Speech Recognition Flow

1. **Audio Capture**: Uses `MediaRecorder` API to capture microphone audio
2. **Streaming**: Audio is streamed to Deepgram via WebSocket in 100ms chunks
3. **Processing**: Deepgram processes audio and returns transcription results
4. **Filtering**: Results are filtered by confidence score (>70% threshold)
5. **Integration**: Final transcriptions are sent to the backend for AI processing

### Key Components

- **DeepgramService**: Manages WebSocket connection and audio streaming
- **Real-time Transcription**: Processes interim and final results
- **Audio Processing**: Handles microphone access and audio encoding
- **Error Recovery**: Automatic reconnection and graceful error handling

## Setup Instructions

### 1. Get Deepgram API Key

1. Visit [Deepgram Console](https://console.deepgram.com/)
2. Sign up or log in to your account
3. Create a new project or use an existing one
4. Navigate to the API Keys section
5. Generate a new API key

### 2. Configure Environment Variables

Create a `.env.local` file in the sherpa directory with the following variables:

```bash
# Deepgram API Configuration
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here

# OpenAI API Configuration (if not already set)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Simli API Configuration (if not already set)
NEXT_PUBLIC_SIMLI_API_KEY=your_simli_api_key_here

# Backend API Configuration (if not already set)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Install Dependencies

The Deepgram SDK is already included in the package.json:

```bash
npm install
# or
yarn install
```

### 4. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser
3. Click "Start" to begin the interaction
4. Grant microphone permissions when prompted
5. Speak into your microphone to test transcription

## Configuration Options

The Deepgram service can be configured with the following options:

```typescript
{
  model: 'nova-2',           // Deepgram model (nova-2, nova, base, enhanced)
  language: 'en-US',         // Language code
  sampleRate: 16000,         // Audio sample rate in Hz
  channels: 1,               // Number of audio channels
  encoding: 'linear16',      // Audio encoding format
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `NEXT_PUBLIC_DEEPGRAM_API_KEY` is set in your environment variables
   - Restart the development server after adding the environment variable

2. **Microphone Permission Denied**
   - Check browser permissions for microphone access
   - Ensure you're using HTTPS in production (required for microphone access)

3. **Connection Issues**
   - Check your internet connection
   - Verify the API key is valid and has sufficient credits
   - Check browser console for detailed error messages

4. **Low Transcription Accuracy**
   - Speak clearly and at normal volume
   - Reduce background noise
   - Check microphone quality
   - Adjust confidence threshold in the code if needed

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed logs about:
- Deepgram connection status
- Audio streaming status
- Transcription results and confidence scores
- Error messages and stack traces

## Performance Considerations

- **Audio Quality**: Higher quality microphones provide better transcription accuracy
- **Network Latency**: Real-time performance depends on internet connection speed
- **Confidence Threshold**: Adjust the 70% confidence threshold based on your needs
- **Chunk Size**: 100ms audio chunks provide good balance between latency and efficiency

## Security Notes

- Keep your Deepgram API key secure and never commit it to version control
- Use environment variables for all API keys
- Consider implementing rate limiting for production use
- Monitor API usage to avoid unexpected charges

## Support

For issues related to:
- **Deepgram API**: Contact Deepgram support or check their documentation
- **Integration**: Check the browser console for error messages
- **Audio Issues**: Verify microphone permissions and hardware
