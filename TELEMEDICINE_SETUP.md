# Telemedicine Service - Twilio Video Setup Guide

## 📋 Overview
Complete telemedicine/video consultation module with Twilio Video integration, secure real-time video sessions, recording capabilities, and session management.

---

## 🚀 Installation & Setup

### Step 1: Install Required NPM Packages

#### Backend (Consultation Service)
```bash
cd services/consultation-service
npm install twilio
```

#### Frontend
```bash
cd frontend
npm install twilio-video
```

### Step 2: Configure Environment Variables

#### Backend (.env in consultation-service)
```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY=your_api_key_here
TWILIO_API_SECRET=your_api_secret_here
TWILIO_STATUS_CALLBACK_URL=https://your-domain.com/status-callback

# MongoDB
MONGODB_URI=mongodb://localhost:27017/telemedicine

# API Gateway
API_GATEWAY_URL=http://localhost:5000
APPOINTMENT_SERVICE_URL=http://localhost:5003
PORT=5004
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Get Twilio Credentials

1. Visit [Twilio Console](https://www.twilio.com/console)
2. Create a new Twilio account or log in
3. Go to **Account Settings** → **API Keys & Tokens**
4. Generate new API Key and API Secret
5. Copy your **Account SID** and **Auth Token**

---

## 🏗️ Architecture & Components

### Backend Endpoints

#### Video Token Generation
```
POST /api/consultations/video/token
Body: { appointmentId, roomName, userName }
Response: { token, roomName }
```

#### Create Video Room
```
POST /api/consultations/video/room
Body: { appointmentId, roomName, maxDuration }
Response: { room, consultation }
```

#### End Video Session
```
POST /api/consultations/video/end
Body: { appointmentId }
Response: { consultation, recordings }
```

#### Get Recordings
```
GET /api/consultations/:id/recordings
Response: { recordings: [...] }
```

### Database Schema

**Consultation Model** includes:
- `twilioRoomName`: Twilio room identifier
- `twilioRoomSid`: Twilio session ID
- `recordingUrl`: URL to recorded video
- `recordingSid`: Recording session ID
- `maxDuration`: Max session duration (30 min default)
- `recordings`: Array of recording metadata

### Frontend Components

#### VideoConsultationPage
- Lists patient's confirmed appointments
- Allows appointment selection
- Starts/ends video sessions
- Manages audio/video controls

#### TwilioVideoRoom
- Renders Twilio video participant grid
- Media control buttons (mic, camera, hang up)
- Responsive layout for multiple participants

---

## 🔐 Security Features

✅ **JWT Authentication** - All endpoints require valid token
✅ **Role-Based Access** - Only doctors can create/end rooms
✅ **Appointment Verification** - Session requires confirmed appointment
✅ **Participant Validation** - Only appointment participants can join
✅ **Recording Encryption** - Twilio handles encryption at rest
✅ **HTTPS Only** - Production deployments require HTTPS

---

## 🎥 Usage Guide

### For Patients

1. Navigate to **"Video Consultation"** in patient sidebar
2. Select a **confirmed appointment**
3. Click **"Start Video Session"**
4. Grant camera/microphone permissions
5. Doctor will see notification and join
6. Use controls: Mute, Camera toggle, Hang up
7. Session ends when doctor disconnects

### For Doctors

1. Navigate to **"Appointments"** dashboard
2. Find confirmed appointment
3. Click **"Start Consultation"** button
4. Creates video room automatically
5. Patients can then join
6. Control video/audio and notes
7. Session records automatically
8. End session when complete

---

## 🧪 Testing

### Manual Testing Steps

1. **Login as Doctor**
   - Go to Doctor Dashboard
   - Find a confirmed appointment
   - Start consultation

2. **Create Video Room**
   - Verify room created in Twilio console
   - Check consultation record updated

3. **Login as Patient**
   - Go to Video Consultation page
   - Select matching appointment
   - Click Start Video Session

4. **Verify Connection**
   - Both users should see video feeds
   - Audio/video controls should work
   - Duration timer should count up

5. **End Session**
   - Doctor clicks "End Call"
   - Recording should be processed
   - Consultation marked as completed

### Using Twilio Console

```bash
# Monitor active rooms
curl https://video.twilio.com/v1/Rooms \
  -u '$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN'

# Check recordings
curl https://video.twilio.com/v1/Rooms/{RoomSid}/Recordings \
  -u '$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN'
```

---

## 🐛 Troubleshooting

### Issue: "Failed to generate video access token"
- ✅ Verify Twilio credentials in .env
- ✅ Check API Key has proper permissions
- ✅ Verify appointmentId exists

### Issue: "Can't connect to video room"
- ✅ Check browser camera/microphone permissions
- ✅ Verify both users are on same network/HTTPS
- ✅ Check Twilio room is active in console

### Issue: "No recordings after session"
- ✅ Verify recordParticipantsOnConnect: true
- ✅ Check Twilio Compositions settings
- ✅ Wait 30-60 seconds for processing

### Issue: "Participants not visible"
- ✅ Check video tracks are being attached
- ✅ Verify both users have camera enabled
- ✅ Check browser permissions for camera

---

## 📊 Monitoring & Analytics

### Session Metrics to Track
```javascript
- sessionDuration: Duration in minutes
- participantCount: Number of users connected
- audioQuality: Network quality indicators
- videoResolution: Recording quality
- recordingUrl: Final recording location
```

### Example Analytics Query
```javascript
const sessions = await Consultation.find({
  status: 'completed',
  createdAt: { $gte: new Date('2024-01-01') }
}).select('durationMin doctorId recordings');
```

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] Test with real Twilio credentials
- [ ] Enable HTTPS everywhere
- [ ] Set proper CORS origins
- [ ] Configure status callbacks
- [ ] Set up monitoring/logging
- [ ] Test recording playback
- [ ] Verify bandwidth requirements
- [ ] Load test with multiple simultaneous sessions

### Twilio Best Practices

1. **Use Media Region** - Route video through nearest region
2. **Enable Network Quality** - Monitor connection quality
3. **Set Bandwidth Limits** - Prevent resource exhaustion
4. **Enable Codec Preferences** - H264 for reliability
5. **Status Callbacks** - Track room lifecycle events

### Configuration for Scale
```javascript
{
  audio: {
    codec: 'opus',
    maxAverageBitrate: 20000 // 20 kbps
  },
  video: {
    codec: 'H264',
    maxFramerate: 24,
    width: { max: 640 },
    height: { max: 480 }
  },
  networkQuality: {
    local: 1,
    remote: 1
  }
}
```

---

## 📞 Support & Resources

- [Twilio Video Documentation](https://www.twilio.com/docs/video)
- [Twilio Node SDK](https://www.twilio.com/docs/libraries/node)
- [Twilio Video SDK for JavaScript](https://www.twilio.com/docs/video/javascript)
- [Twilio Console](https://www.twilio.com/console)

---

## ✅ Features Implemented

✅ Real-time video consultation with Twilio  
✅ Automatic session recording  
✅ Audio/video controls  
✅ Multi-participant support  
✅ JWT-based authentication  
✅ Appointment-linked sessions  
✅ Recording storage & playback  
✅ Session history tracking  
✅ Mobile-responsive UI  
✅ Error handling & logging

---

## 🔄 Next Steps

1. **Install packages**: `npm install twilio twilio-video`
2. **Configure .env**: Add Twilio credentials
3. **Start services**: Run consultation service
4. **Test**: Follow testing guide above
5. **Deploy**: Use production checklist

---

Last Updated: April 17, 2026
