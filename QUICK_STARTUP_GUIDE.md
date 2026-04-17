# Quick Service Startup Guide

## 🚀 Start All Services (Recommended Order)

### Prerequisites
- Node.js 16+ installed
- MongoDB running (or adjust connection strings)
- All npm dependencies installed in each service

### Terminal Setup
Open **5 separate terminals** in the project root:

---

## Terminal 1: API Gateway (Port 5000)
```bash
cd services/api-gateway
npm run dev
```
✅ Expected output:
```
🚀 API Gateway v2 running on port 5000
🔗 Routes Managed: auth, patients, appointments, symptoms, consultations, payments, doctors, symptom-checker
```

---

## Terminal 2: Auth Service (Port 5001)
```bash
cd services/auth-service
npm run dev
```
✅ Expected output:
```
Auth service running on port 5001
MongoDB connected
```

---

## Terminal 3: Patient Service (Port 5002)
```bash
cd services/patient-service
npm run dev
```
✅ Expected output:
```
Patient service running on port 5002
```

---

## Terminal 4: Payment Service (Port 5005) ⭐ IMPORTANT
```bash
cd services/payment-service
npm run dev
```
✅ Expected output:
```
Payment-Notification service running on port 5005
MongoDB connected
```

**For error: `GET /api/payments/status/:id` returns 404** → Make sure this terminal shows the service is running!

---

## Terminal 5: Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
✅ Expected output:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Optional Additional Services

### Doctor Service (Port 5006)
```bash
cd services/doctor-service
npm run dev
```

### Appointment Service (Port 5003)
```bash
cd services/appointment-service
npm run dev
```

### Consultation Service (Port 5004)
```bash
cd services/consultation-service
npm run dev
```

### Symptom Checker (Port 5007)
```bash
cd services/symptom-checker-service
npm run dev
```

---

## ✅ Verification Checklist

Once all services are running, verify in another terminal:

```bash
# 1. API Gateway health
curl http://localhost:5000/health
# Expected: { "status": "API Gateway is running" }

# 2. Payment Service health
curl http://localhost:5005/health
# Expected: { "success": true, "message": "Payment-Notification service running", "port": 5005 }

# 3. Frontend running
open http://localhost:5173
# Should see login page
```

---

## Common Port Issues

| Port | Service | Fix |
|------|---------|-----|
| 5000 | API Gateway | `lsof -i :5000` → Kill process or change PORT env var |
| 5001 | Auth Service | `lsof -i :5001` → Kill process or change PORT env var |
| 5005 | Payment Service | **CRITICAL** - Needed for payment features |
| 5173 | Frontend (Vite) | `lsof -i :5173` → Kill process |

### Kill Port on Windows (PowerShell)
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property ProcessId

# Kill process
Stop-Process -Id <PID> -Force
```

### Kill Port on macOS/Linux
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

---

## Environment Variables

### Create `.env` files if needed:

**services/payment-service/.env:**
```
MONGO_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=your_jwt_secret_key
PORT=5005
PAYHERE_MERCHANT_ID=1226148
PAYHERE_MERCHANT_SECRET=your_secret
PAYHERE_SANDBOX=true
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:5000
```

---

## Troubleshooting

### Issue: Payment Service Not Responding
```bash
# 1. Check if running on correct port
curl http://localhost:5005/health

# 2. Check logs in Terminal 4
# Look for MongoDB connection errors
# Look for port already in use errors

# 3. Restart service
# In Terminal 4, press Ctrl+C and run: npm run dev
```

### Issue: API Gateway Can't Reach Payment Service
```bash
# In Terminal 1 logs, check for:
# "Gateway Proxy Error: connect ECONNREFUSED 127.0.0.1:5005"

# Solution: Make sure Terminal 4 is running payment service
curl http://localhost:5005/health
```

### Issue: Frontend Can't Connect to API
```bash
# Check browser console for CORS errors
# Verify API Gateway is running on 5000
# Verify VITE_API_URL env var is set correctly
```

---

## Quick Reset

If things are broken, do a full restart:

```bash
# Kill all Node processes (be careful!)
# macOS/Linux:
killall node

# Windows PowerShell:
Get-Process node | Stop-Process -Force

# Then restart all terminals in order (Terminal 1-5)
```

---

## Minimal Setup (Essentials Only)

If you only need the payment flow to work:
- ✅ Terminal 1: API Gateway
- ✅ Terminal 2: Auth Service  
- ✅ Terminal 4: Payment Service ⭐
- ✅ Terminal 5: Frontend

Remaining services (Doctor, Appointment, Consultation) are optional for basic testing.

---

## Next Steps After Startup

1. Open `http://localhost:5173` in browser
2. Log in with test account
3. Navigate to appointment payment
4. Try initiating payment
5. Check browser console for errors (F12 → Console tab)

If you see 404 payment errors:
1. ✅ Verify Terminal 4 (Payment Service) is running
2. ✅ Check that service shows "running on port 5005"
3. ✅ Restart services in order
