# Backend Integration Guide for Simli Video Conversation

## Overview

The Simli (Sherpa) project has been updated to use the backend project for conversation logic instead of direct OpenAI Realtime API calls. This integration maintains all audio processing capabilities while leveraging the backend's sophisticated conversation management.

## Architecture Changes

### Previous Architecture (Direct OpenAI)
```
User Audio → OpenAI Realtime API → Avatar Speech
```

### New Architecture (Backend Integration)
```
User Audio → Web Speech API (STT) → Backend /message → OpenAI TTS → Avatar Speech
                                      ↓
                              Simli Client (Lip Sync)
```

## Key Components

### 1. **Speech-to-Text (STT)**
- Uses browser's Web Speech API for real-time transcription
- Converts user's spoken words to text
- Supports continuous recognition with interim results

### 2. **Backend Message Processing**
- Sends transcribed text to backend at `/message` endpoint
- Backend handles conversation logic, context, and state management
- Returns text responses with metadata (stage, status, etc.)

### 3. **Text-to-Speech (TTS)**
- Uses OpenAI TTS API to convert backend text responses to audio
- Maintains voice consistency with configurable voice selection
- Generates PCM audio at 24kHz, downsampled to 16kHz for Simli

### 4. **Simli Client (Unchanged)**
- Continues to handle avatar animation and lip-sync
- Receives audio chunks for smooth playback
- Manages video rendering and facial expressions

## Environment Configuration

Create a `.env.local` file in the sherpa directory with:

```bash
# Simli API Configuration
NEXT_PUBLIC_SIMLI_API_KEY=your_simli_api_key_here

# OpenAI API Configuration (for Text-to-Speech only)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Backend Mode - where the backend server is running
# Options: DEVELOPMENT_LOCAL | PRODUCTION
NEXT_PUBLIC_BACKEND_MODE=DEVELOPMENT_LOCAL
```

### Backend URLs
- **DEVELOPMENT_LOCAL**: `http://localhost:3000`
- **PRODUCTION**: `https://eliza-backend-production-4791.up.railway.app`

## Code Changes

### Main File: `app/SimliOpenAI.tsx`

#### Removed
- `@openai/realtime-api-beta` package dependency
- `RealtimeClient` and related OpenAI realtime logic
- `openAIClientRef` reference
- Direct OpenAI API event handlers

#### Added
- `src/config/api.ts` - Backend API configuration
- `axios` for HTTP requests to backend
- Web Speech API integration for STT
- OpenAI TTS API integration for response audio
- Speech recognition state management

### New File: `src/config/api.ts`

Provides centralized API configuration:
- `getMessageUrl()` - Returns backend message endpoint URL
- Environment-based configuration switching

## Flow Diagram

```
┌─────────────┐
│    User     │
│   Speaks    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Web Speech API     │
│  (Browser STT)      │
└──────┬──────────────┘
       │ Transcribed Text
       ▼
┌─────────────────────┐
│  Backend /message   │
│  - Discovery Logic  │
│  - Context Mgmt     │
│  - State Tracking   │
└──────┬──────────────┘
       │ Response Text
       ▼
┌─────────────────────┐
│   OpenAI TTS API    │
│   (Text → Audio)    │
└──────┬──────────────┘
       │ Audio PCM
       ▼
┌─────────────────────┐
│  Downsample Filter  │
│  24kHz → 16kHz      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Simli Client      │
│   - Avatar Render   │
│   - Lip Sync        │
└─────────────────────┘
```

## Benefits

1. **Centralized Conversation Logic**: All conversation handling is in the backend, making it easier to maintain and update
2. **Consistent User Experience**: Same conversation logic for both text chat (frontend) and video chat (sherpa)
3. **Easier Testing**: Backend can be tested independently
4. **Better State Management**: Backend manages user context, conversation stages, and data collection
5. **Minimal Changes**: Audio processing remains unchanged, only conversation logic is routed through backend

## Usage

1. **Start the Backend**:
   ```bash
   cd backend
   npm start  # or pnpm start
   ```

2. **Start Simli (Sherpa)**:
   ```bash
   cd sherpa
   npm run dev
   ```

3. **Click "Start"** to begin video conversation
4. **Speak** to interact with the avatar
5. The system will:
   - Transcribe your speech
   - Send to backend
   - Get response
   - Convert to speech
   - Animate avatar

## Browser Compatibility

- **Web Speech API**: Works best in Chrome/Edge (full support)
- **Firefox/Safari**: Limited support, may need alternative STT solution
- **Fallback**: If Speech Recognition not available, will log warning

## Troubleshooting

### No Microphone Permission
- Ensure browser has microphone access
- Check HTTPS (required for getUserMedia in production)

### Speech Recognition Not Working
- Use Chrome or Edge browser
- Check console for recognition errors
- Verify microphone is working

### Backend Connection Issues
- Ensure backend is running on correct port (3000)
- Check `NEXT_PUBLIC_BACKEND_MODE` environment variable
- Verify CORS is enabled on backend

### No Avatar Speech
- Check OpenAI API key is valid
- Verify TTS API quota
- Check browser console for audio errors

## API Reference

### Backend Endpoint

**POST** `/message`

Request:
```json
{
  "text": "User's spoken message",
  "userId": "unique_user_id",
  "userName": "username"
}
```

Response:
```json
[
  {
    "text": "Response from backend",
    "sender": "grace",
    "timestamp": "2025-10-07T...",
    "metadata": {
      "stage": "trust_building",
      "responseStatus": "Normal",
      "actionName": "grand-villa-discovery"
    }
  }
]
```

## Future Enhancements

1. **Alternative STT**: Implement OpenAI Whisper for better browser compatibility
2. **Audio Streaming**: Stream TTS audio for lower latency
3. **Voice Activity Detection**: Better handling of when user is speaking
4. **Interruption Handling**: Allow user to interrupt avatar mid-speech
5. **Offline Support**: Cache common responses

## Notes

- OpenAI API is now ONLY used for Text-to-Speech, not for conversation logic
- All conversation logic, context, and state is managed by the backend
- Audio processing (filtering, downsampling, chunking) remains unchanged
- The integration maintains the same UX while centralizing business logic
