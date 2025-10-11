# Testing Guide for Backend-Integrated Simli Video Conversation

## Pre-Testing Checklist

### 1. Environment Setup

Create `.env.local` file in the `sherpa` directory:

```bash
NEXT_PUBLIC_SIMLI_API_KEY=your_simli_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_BACKEND_MODE=DEVELOPMENT_LOCAL
```

### 2. Backend Server Running

Ensure the backend is running on port 3000:

```bash
cd backend
npm start
# Should see: "Integrated server started on port 3000"
# Should see: "Message API: http://localhost:3000/message"
```

### 3. Check Backend Endpoint

Test the backend endpoint manually:

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","userId":"test_user","userName":"test_user"}'
```

Expected response:
```json
[{
  "text": "Welcome to Grand Villas...",
  "sender": "grace",
  "timestamp": "...",
  "metadata": {...}
}]
```

## Testing Steps

### Step 1: Start the Simli Application

```bash
cd sherpa
npm run dev
```

Visit: http://localhost:3000 (or the port shown in terminal)

### Step 2: Initial Load Test

**Expected Behavior:**
- ✅ Page loads without errors
- ✅ No console errors
- ✅ "Start" button is visible
- ✅ Avatar preview may be visible (depending on config)

**Check Console for:**
- No errors related to missing modules
- No API configuration errors

### Step 3: Microphone Permission Test

**Action:** Click the "Start" button

**Expected Behavior:**
- ✅ Browser prompts for microphone permission
- ✅ Grant permission when prompted
- ✅ Console logs: "Requesting microphone permission..."
- ✅ Console logs: "Microphone permission granted"

**Troubleshooting:**
- If no prompt appears, check browser settings
- Ensure HTTPS or localhost (required for getUserMedia)
- Try different browser (Chrome recommended)

### Step 4: Simli Client Initialization Test

**After granting microphone permission:**

**Expected Behavior:**
- ✅ Console logs: "Starting..."
- ✅ Console logs: "Simli Client initialized"
- ✅ Console logs: "SimliClient connected"
- ✅ Video element appears showing avatar
- ✅ "Stop" button appears

**Troubleshooting:**
- Check SIMLI_API_KEY is valid
- Check network tab for Simli API calls
- Verify no CORS errors

### Step 5: Speech Recognition Test

**After Simli connects:**

**Expected Behavior:**
- ✅ Console logs: "Initializing speech recognition..."
- ✅ Console logs: "Speech recognition started"
- ✅ Initial greeting plays (after ~1 second)
- ✅ Avatar mouth moves during greeting

**Troubleshooting:**
- If "Speech recognition not supported" warning:
  - Use Chrome or Edge browser
  - Check browser compatibility
- If no initial greeting:
  - Check OpenAI API key
  - Check TTS API quota
  - Check network tab for TTS requests

### Step 6: User Speech Input Test

**Action:** Speak into your microphone

Example phrases to try:
- "Hello"
- "I need help finding a place for my mother"
- "Tell me about Grand Villas"

**Expected Behavior:**
- ✅ User message appears on screen (interim results with "...")
- ✅ Console logs: "User said: [your message]"
- ✅ Console logs: "Sending message to backend: [your message]"
- ✅ Network tab shows POST to `/message` endpoint
- ✅ Console logs: "Backend response: [response text]"

**Troubleshooting:**
- If not detecting speech:
  - Check microphone is working
  - Speak clearly and loudly
  - Check browser console for recognition errors
- If no backend request:
  - Check backend URL configuration
  - Verify backend is running
  - Check CORS headers

### Step 7: Backend Response Test

**After speaking:**

**Expected Behavior:**
- ✅ Console logs: "Converting text to speech..."
- ✅ Console logs: "Text-to-speech conversion complete"
- ✅ Audio plays through speakers
- ✅ Avatar mouth syncs with speech
- ✅ Response is contextually relevant to your input

**Troubleshooting:**
- If no audio:
  - Check OpenAI API key
  - Check speaker/audio output
  - Check network tab for TTS API call
- If avatar doesn't move:
  - Check Simli connection
  - Check console for audio chunk errors
- If response is generic/error:
  - Check backend response in network tab
  - Verify backend conversation logic is working

### Step 8: Conversation Flow Test

**Action:** Have a multi-turn conversation

Example flow:
1. "Hello" → Expect: Greeting
2. "I'm looking for help with senior living" → Expect: Understanding response
3. "My mother needs care" → Expect: Questions about mother's situation
4. Continue natural conversation

**Expected Behavior:**
- ✅ Backend maintains context across turns
- ✅ Responses are relevant to conversation history
- ✅ Conversation stages progress (check metadata in console)
- ✅ Avatar responds smoothly to each input

**Check Console for:**
- Stage transitions (metadata.stage)
- Response status (metadata.responseStatus)
- No duplicate requests
- Proper turn-taking (user speaks → backend responds → ready for next input)

### Step 9: Interruption Handling Test

**Action:** Try to speak while avatar is speaking

**Current Behavior:**
- System logs: "Avatar is speaking, ignoring user input"
- User input is not processed until avatar finishes

**Note:** This is current behavior. Future enhancement may allow interruptions.

### Step 10: Stop and Cleanup Test

**Action:** Click the "Stop" button

**Expected Behavior:**
- ✅ Console logs: "Stopping interaction..."
- ✅ Console logs: "Speech recognition stopped"
- ✅ Console logs: "Interaction stopped"
- ✅ Avatar video stops
- ✅ "Start" button reappears
- ✅ Microphone light turns off in browser
- ✅ No lingering audio or recognition

**Troubleshooting:**
- If microphone stays active, refresh page
- Check browser task manager for resource cleanup

## Integration Tests

### Test 1: Backend Connection

**Verify:** Sherpa communicates with backend correctly

**Steps:**
1. Open browser DevTools → Network tab
2. Start conversation
3. Speak a message
4. Find POST request to `/message`

**Verify Response:**
- Status: 200 OK
- Response body has text and metadata
- Content-Type: application/json
- CORS headers present

### Test 2: Speech Recognition

**Verify:** STT accurately transcribes speech

**Steps:**
1. Speak clearly: "This is a test message"
2. Check console for transcription
3. Verify text sent to backend

**Pass Criteria:**
- Transcription is accurate (or close)
- Final result is processed (not interim)
- Text is properly formatted

### Test 3: Text-to-Speech

**Verify:** TTS converts backend responses to audio

**Steps:**
1. Monitor network tab
2. Send a message
3. Watch for request to `api.openai.com/v1/audio/speech`

**Verify:**
- Request includes backend response text
- Response is audio data (ArrayBuffer)
- Audio plays successfully

### Test 4: Audio Processing

**Verify:** Audio downsampling and chunking works

**Steps:**
1. Enable verbose logging if needed
2. Send message and get response
3. Check console for audio chunk logs

**Pass Criteria:**
- Logs show: "Sent audio chunk to Simli: [duration]"
- Multiple chunks for longer responses
- No audio artifacts or glitches

### Test 5: End-to-End Flow

**Complete user journey:**

```
User speaks → STT → Backend → TTS → Avatar speaks
```

**Verify each step:**
1. ✅ Audio captured
2. ✅ Transcribed to text
3. ✅ Sent to backend
4. ✅ Backend responds
5. ✅ Converted to speech
6. ✅ Avatar animates
7. ✅ Ready for next input

## Common Issues and Solutions

### Issue: "Speech recognition not supported"

**Solution:**
- Use Chrome or Edge browser (best support)
- Check browser version (update if old)
- Consider implementing Whisper API fallback

### Issue: Backend connection refused

**Solutions:**
- Verify backend is running: `curl http://localhost:3000/message`
- Check `NEXT_PUBLIC_BACKEND_MODE` environment variable
- Verify no firewall blocking port 3000
- Check backend logs for errors

### Issue: No audio output

**Solutions:**
- Check OpenAI API key is valid and has credit
- Verify speaker/audio output device
- Check TTS request in network tab for errors
- Look for console errors about audio context

### Issue: Avatar not lip-syncing

**Solutions:**
- Verify Simli client connected (check console)
- Check audio chunks are being sent
- Verify Simli API key is valid
- Check network for Simli WebSocket connection

### Issue: Delayed responses

**Potential causes:**
- Backend processing time
- TTS API latency
- Network latency
- Large response text

**Solutions:**
- Monitor network tab for timing
- Consider implementing streaming TTS
- Check backend performance
- Optimize chunk size

### Issue: Conversation context lost

**Solutions:**
- Check backend is maintaining user sessions
- Verify userId is consistent across requests
- Check backend logs for session management
- Ensure backend database is persisting data

## Performance Metrics

**Ideal Timing:**
- STT recognition: < 1 second
- Backend response: < 2 seconds
- TTS generation: < 3 seconds
- Total latency: < 6 seconds

**Monitor in Network Tab:**
- `/message` request duration
- TTS API request duration
- Total time from speech to avatar response

## Browser Compatibility

**Recommended:** Chrome or Edge (latest)

**Web Speech API Support:**
- ✅ Chrome/Edge: Full support
- ⚠️ Safari: Partial support
- ⚠️ Firefox: Limited support

**Testing Matrix:**
| Browser | Speech Recognition | TTS | Simli |
|---------|-------------------|-----|-------|
| Chrome  | ✅ Full           | ✅  | ✅    |
| Edge    | ✅ Full           | ✅  | ✅    |
| Safari  | ⚠️ Limited        | ✅  | ✅    |
| Firefox | ⚠️ Limited        | ✅  | ✅    |

## Success Criteria

The integration is successful if:

1. ✅ User can speak and be understood
2. ✅ Backend receives and processes messages
3. ✅ Responses are contextually appropriate
4. ✅ Avatar speaks and lip-syncs correctly
5. ✅ Conversation flows naturally
6. ✅ No errors in console or network
7. ✅ Performance is acceptable (< 6s total latency)
8. ✅ Resources cleanup properly on stop

## Next Steps After Testing

If all tests pass:
1. Test with different user scenarios
2. Test longer conversations
3. Test edge cases (silence, background noise, etc.)
4. Optimize performance if needed
5. Consider implementing enhancements (see BACKEND_INTEGRATION.md)

If tests fail:
1. Note specific failure points
2. Check relevant troubleshooting section
3. Review console and network logs
4. Verify all configuration is correct
5. Test backend independently
6. Test frontend components separately
