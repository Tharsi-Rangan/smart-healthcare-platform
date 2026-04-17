# 401 Unauthorized Error - Diagnosis & Solutions

## Problem Summary
Your frontend is receiving **401 Unauthorized** errors when calling the following APIs:
- `/api/patients/medical-history`
- `/api/symptoms/history`
- `/api/appointments/my`
- `/api/patients/summary`

The console shows **"Adding Token to Request: Yes"**, which means the token IS being added, but the server is still rejecting it.

---

## Root Cause Analysis

### 1. **Token Authentication Flow**
✅ **Frontend Setup is CORRECT:**
- Token is stored in localStorage via `authStorage.js`
- `apiClient.js` adds token to requests with "Bearer " prefix
- AuthContext manages token state properly

✅ **Server Middleware is CORRECT:**
- All services expect "Authorization: Bearer {token}" header
- All services use the same JWT_SECRET (except consultation-service)
- Token verification uses standard JWT

### 2. **Potential Issues (In Order of Likelihood)**

#### **Issue #1: Services Not Running** ⚠️ (MOST LIKELY)
The patient-service, appointment-service, and symptom-checker-service might not be running.

**Check:**
```bash
# List all running processes
lsof -i :5002  # patient-service
lsof -i :5003  # appointment-service  
lsof -i :5006  # symptom-checker-service (if exists)
```

**Solution:** Start the services
```bash
cd services/patient-service && npm run dev
cd services/appointment-service && npm run dev
cd services/symptom-checker-service && npm run dev  # if needed
```

---

#### **Issue #2: Token Expired**
Tokens expire after 1 day (set in auth-service/src/config/env.js: `jwtExpiresIn: "1d"`).

**Check:**
1. Open browser DevTools → Application → Local Storage
2. Find the `token` value
3. Visit [jwt.io](https://jwt.io) and paste your token
4. Check the "exp" (expiration) field

**Solution:** 
- Log out and log in again to get a fresh token
- Or set a longer expiry in `services/auth-service/src/config/env.js`:
  ```javascript
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d", // Change from "1d"
  ```

---

#### **Issue #3: Environment Variables Not Loaded**
If services are started before .env files are created, they won't read the JWT_SECRET.

**Check:**
```bash
# Verify .env files exist
ls services/auth-service/.env
ls services/patient-service/.env
ls services/appointment-service/.env
```

**Solution:** Restart services after verifying .env files exist
```bash
# Kill all node processes
npx kill-port 5001 5002 5003 5004 5005 5006

# Restart services
npm run dev
```

---

#### **Issue #4: Incorrect API Base URL**
The frontend is calling `http://localhost:5000`, but services run on different ports.

**Current Setup:**
- Auth Service: Port 5001
- Patient Service: Port 5002
- Appointment Service: Port 5003
- Symptom Checker: Port 5006
- Consultation Service: Port 5004
- API Gateway: Port 5000 (if exists)

**Check in frontend/src/services/apiClient.js:**
```javascript
baseURL: "http://localhost:5000", // ← Is API Gateway running here?
```

**Check in frontend/src/services/appointmentApi.js:**
```javascript
baseURL: import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5000",
```

**Solution:** 
- Either start an API Gateway on port 5000 that routes to other services, OR
- Update frontend to call correct service ports directly

---

## Step-by-Step Diagnostic Guide

### Step 1: Verify Token is Valid
```javascript
// Open DevTools Console and run:
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Token length:', token?.length);
```

### Step 2: Check API Gateway / Service Connectivity
```bash
# Test if patient-service is accessible
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:5002/api/patients/medical-history

# Test with auth-service token
curl http://localhost:5001/api/auth/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Check Service Logs
Each service should print logs when receiving requests.
```bash
# Check if you see request logs from services
# If no logs appear, the service isn't running
```

### Step 4: Verify Environment Variables
```bash
# Print JWT_SECRET from each service's .env
grep JWT_SECRET services/*/.*env
```

**Expected output:** All services should have the same JWT_SECRET (except consultation-service)

---

## Quick Fixes (Try These First)

### Fix #1: Restart All Services
```bash
# Terminal 1: Kill all node processes
npx kill-port 5000 5001 5002 5003 5004 5005 5006

# Terminal 2: Go to project root and start services
npm run dev  # or your start script
```

### Fix #2: Clear Browser Cache & Token
```javascript
// DevTools Console:
localStorage.clear();
sessionStorage.clear();
// Reload page and log in again
```

### Fix #3: Check JWT_SECRET Consistency
All .env files should have the same JWT_SECRET (they currently do - this is good):
```
JWT_SECRET=677981fce62795893d6ea00b6b28fd8bb334ea1d5d33fdec504a4a3b3a32b269
```

---

## Configuration Files to Review

### 1. Frontend API Setup
- ✅ `frontend/src/services/apiClient.js` - Main API client
- ✅ `frontend/src/services/appointmentApi.js` - Creates separate axios instance
- ✅ `frontend/src/features/auth/authStorage.js` - Token storage
- ✅ `frontend/src/features/auth/AuthContext.jsx` - Auth state management

### 2. Backend Middleware
- ✅ `services/auth-service/src/middleware/auth.middleware.js` - Token validation
- ✅ `services/patient-service/src/middleware/authMiddleware.js` - Token validation
- ✅ `services/appointment-service/src/middleware/auth.middleware.js` - Token validation

### 3. Environment Files (Verified - JWT_SECRET is same across all)
- ✅ `services/auth-service/.env` - JWT_SECRET set correctly
- ✅ `services/patient-service/.env` - JWT_SECRET set correctly
- ✅ `services/appointment-service/.env` - JWT_SECRET set correctly
- ✅ `services/symptom-checker-service/.env` - JWT_SECRET set correctly

---

## Recommended Action Plan

1. **First:** Restart all services
   ```bash
   npx kill-port 5000 5001 5002 5003 5004 5005 5006
   npm run dev
   ```

2. **Second:** Clear browser token and log in again
   - Open DevTools → Application → Local Storage
   - Clear all localStorage
   - Log out and log in again

3. **Third:** Test API connectivity directly
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5002/api/patients/medical-history
   ```

4. **If still failing:** Check service logs to see exact error message

---

## Expected vs Actual

### Expected Flow:
1. User logs in → Auth service returns JWT token ✅
2. Token saved to localStorage ✅
3. Frontend adds "Authorization: Bearer {token}" to requests ✅
4. Services verify JWT with JWT_SECRET ✅
5. Request succeeds with 200 OK ❌ (Getting 401 instead)

### Why It's Failing:
Services are likely **not running** or **token is expired**

---

## Next Steps

Please run the diagnostics above and share:
1. Output of `lsof -i :5002` (is patient-service running?)
2. The JWT token value from localStorage (check expiration at jwt.io)
3. Service logs showing the error
4. Result of curl test to directly call the API

This will pinpoint the exact issue.
