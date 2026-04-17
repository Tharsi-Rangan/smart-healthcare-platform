# 🚀 Telemedicine Service - Quick Start Guide

Get your video consultation system running in 5 minutes!

---

## Step 1: Install Dependencies (2 min)

```bash
# Go to consultation service directory
cd services/consultation-service
npm install twilio

# Go to frontend directory
cd ../../frontend
npm install twilio-video

# Done!
```

---

## Step 2: Get Twilio Credentials (1 min)

1. Go to https://www.twilio.com/console
2. Sign up (free account includes $15 credit)
3. Copy your **Account SID** from main dashboard
4. Go to **Account Settings** → **API Keys & Tokens**
5. Generate new **API Key** (get SID and Secret)
6. Copy **Auth Token** from main dashboard

You'll have:
- `TWILIO_ACCOUNT_SID` ← Account SID
- `TWILIO_AUTH_TOKEN` ← Auth Token
- `TWILIO_API_KEY` ← API Key SID
- `TWILIO_API_SECRET` ← API Key Secret

---

## Step 3: Configure .env (1 min)

Create `services/consultation-service/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_secret_here
MONGODB_URI=mongodb://localhost:27017/telemedicine
APPOINTMENT_SERVICE_URL=http://localhost:5003
API_GATEWAY_URL=http://localhost:5000
PORT=5004
```

---

## Step 4: Start Services (1 min)

### Terminal 1: Start Consultation Service
```bash
cd services/consultation-service
npm start
```

You should see:
```
✅ Consultation service running on port 5004
✅ Connected to MongoDB
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

---

## Step 5: Test It! (0 min - You're done!)

### As a Doctor:
1. Login as doctor
2. Go to **Appointments**
3. Find a **confirmed appointment**
4. Click **"Start Consultation"**
5. Video room created ✅

### As a Patient:
1. Login as patient
2. Go to **Video Consultation** (sidebar)
3. Select the confirmed appointment
4. Click **"Start Video Session"**
5. **Allow camera/microphone permissions**
6. See video feed ✅
7. Use controls to mute/camera toggle

---

## ✅ Features You Get

- ✨ Real-time video sessions
- 🎙️ Audio communication
- 🎬 Automatic recording
- 🔐 Secure (JWT auth)
- 📱 Mobile responsive
- ⚙️ Media controls
- 📹 Recording playback

---

## 🐛 Troubleshooting

### "Twilio credentials not found"
→ Check .env file exists and has all 4 credentials

### "Can't connect to video room"
→ Allow camera/microphone permissions in browser

### "No video feed showing"
→ Check browser DevTools → Permissions
→ Make sure both users are on same network

### "Recording not saving"
→ May take 30-60 seconds to process
→ Check Twilio console for recording status

---

## 📊 What's Happening Behind the Scenes

```
Patient Clicks "Start Video Session"
    ↓
Frontend requests access token from backend
    ↓
Backend (Node) generates JWT using Twilio credentials
    ↓
Backend creates Twilio video room
    ↓
Frontend receives token & connects to room
    ↓
Twilio automatically records the session
    ↓
Doctor joins from their appointment
    ↓
Both see video, audio, can control media
    ↓
Doctor ends session
    ↓
Backend retrieves recording URL
    ↓
Recording saved in database for playback
```

---

## 📞 Need Help?

- **Twilio Docs**: https://www.twilio.com/docs/video
- **Setup Guide**: See TELEMEDICINE_SETUP.md
- **Full Docs**: See TELEMEDICINE_IMPLEMENTATION.md

---

## 🎉 You're All Set!

Your telemedicine system is now live. Happy consulting! 🩺

---

**Last Updated:** April 17, 2026
**Status:** ✅ Ready to Deploy
