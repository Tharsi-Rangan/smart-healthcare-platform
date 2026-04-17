# 401 Error - Code Fixes & Improvements

## Issue 1: Multiple API Client Instances (Possible Cause)

### Problem
You have TWO separate axios client instances:
1. `apiClient.js` - Has request interceptor to add token
2. `appointmentApi.js` - Creates its own client without interceptor

This inconsistency could cause issues.

### Current Code (appointmentApi.js)
```javascript
const appointmentClient = axios.create({
  baseURL: import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthConfig = (token) => {
  const authToken = token || getToken();
  if (!authToken) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
};

export const getPatientAppointments = async (token) => {
  const response = await appointmentClient.get(
    "/api/appointments/my",
    getAuthConfig(token)  // ← Token not guaranteed to be passed!
  );
  return response.data;
};
```

### Problem
**Components call without token:**
```javascript
// VideoConsultationPage.jsx - Line 25
const data = await getPatientAppointments();  // ← No token passed!
```

---

## FIX #1: Consolidate API Clients (Recommended)

Use a single `apiClient.js` for all requests with an interceptor:

### Updated appointmentApi.js
```javascript
import apiClient from "./apiClient";

export const getPatientAppointments = async () => {
  const response = await apiClient.get("/api/appointments/my");
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await apiClient.get("/api/appointments/my");
  return response.data;
};

export const createAppointment = async (payload) => {
  const response = await apiClient.post("/api/appointments", payload);
  return response.data;
};

export const getAppointmentById = async (appointmentId) => {
  const response = await apiClient.get(`/api/appointments/${appointmentId}`);
  return response.data;
};

// ... rest of functions without getAuthConfig pattern
```

### Why This Works
- Single interceptor adds token to ALL requests
- No need to manually pass token to each function
- Cleaner code
- Consistent token handling

---

## FIX #2: Add Error Handler for 401 (Prevent Infinite Loops)

### Add to frontend/src/services/apiClient.js
```javascript
import axios from "axios";
import { getToken, clearAuthData } from "../features/auth/authStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("Adding Token to Request:", token ? "Yes" : "No");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 (NEW)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid/expired - clear it and redirect to login
      console.error("Unauthorized - Token invalid or expired");
      clearAuthData();
      
      // Optional: Redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## FIX #3: Ensure Token is Passed Correctly

### Updated VideoConsultationPage.jsx (Line 25)
**BEFORE:**
```javascript
const data = await getPatientAppointments();
```

**AFTER:**
```javascript
import { useAuth } from "../../features/auth/AuthContext";

function VideoConsultationPage() {
  const { token } = useAuth(); // ← Get token from context
  
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await getPatientAppointments(); // ← apiClient handles token
        const confirmedAppointments = data.filter((apt) => apt.status === "confirmed");
        setAppointments(confirmedAppointments);
        // ...
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load appointments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) { // ← Only load if authenticated
      loadAppointments();
    }
  }, [token]); // ← Re-run if token changes
```

---

## FIX #4: Check API Gateway Configuration

### Option A: Use API Gateway (Recommended for Production)
The docker-compose.yml shows port 5000, but no API Gateway service is defined.

**Create `services/api-gateway/server.js`:**
```javascript
const express = require('express');
const { createProxyMiddleware } = require('express-http-proxy');
const cors = require('cors');

const app = express();

app.use(cors());

// Route requests to appropriate services
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
}));

app.use('/api/patients', createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
}));

app.use('/api/appointments', createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
}));

app.use('/api/symptoms', createProxyMiddleware({
  target: 'http://localhost:5006',
  changeOrigin: true,
}));

// ... other services

app.listen(5000, () => {
  console.log('API Gateway running on port 5000');
});
```

### Option B: Direct Service Calls (Development Only)
Update `frontend/src/services/apiClient.js` to call services directly:

```javascript
// For development, call services directly instead of through gateway
const servicePort = {
  auth: 5001,
  patient: 5002,
  appointment: 5003,
  symptom: 5006,
  consultation: 5004,
};

// This approach requires updating each service API call...
// Not recommended - use API Gateway instead
```

---

## FIX #5: Verify JWT_SECRET Across All Services

### Check All .env Files
```bash
for service in auth-service patient-service appointment-service symptom-checker-service; do
  echo "=== $service ==="
  grep JWT_SECRET services/$service/.env
done
```

### Expected Output
All services (except consultation-service) should have:
```
JWT_SECRET=677981fce62795893d6ea00b6b28fd8bb334ea1d5d33fdec504a4a3b3a32b269
```

**If different:** Update to match
```bash
# Use a strong random secret
openssl rand -hex 32
# Output: 677981fce62795893d6ea00b6b28fd8bb334ea1d5d33fdec504a4a3b3a32b269

# Update all .env files to use same secret
```

---

## FIX #6: Add Token Expiry Handling

### Update services/auth-service/src/config/env.js
```javascript
export const env = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d", // Changed from "1d" to "7d"
  clientUrl: process.env.CLIENT_URL,
  // ... rest
};
```

---

## FIX #7: Add Debug Logging to Backend

### Update services/patient-service/src/middleware/authMiddleware.js
```javascript
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[AUTH ERROR] Missing or invalid auth header", {
      authHeader: authHeader ? "present" : "missing",
      startsWith: authHeader?.startsWith("Bearer ") || false,
    });
    return sendError(res, 401, "Not authorized. Token missing.");
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("[AUTH] Verifying token with JWT_SECRET...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("[AUTH] Token verified successfully for user:", decoded.email);

    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    console.error("[AUTH ERROR] Token verification failed:", {
      message: error.message,
      name: error.name,
      expiredAt: error.expiredAt,
    });
    return sendError(res, 401, "Not authorized. Invalid token.");
  }
};

module.exports = { protect };
```

---

## Implementation Priority

1. **CRITICAL:** Verify services are running on correct ports
2. **HIGH:** Consolidate API clients (Fix #1)
3. **HIGH:** Verify JWT_SECRET consistency (Fix #5)
4. **MEDIUM:** Add response interceptor for 401 (Fix #2)
5. **MEDIUM:** Implement API Gateway (Fix #4)
6. **LOW:** Add debug logging (Fix #7)

---

## Testing After Fixes

### Test 1: Direct API Call
```bash
# 1. Get a token by logging in via UI
# 2. Copy token from DevTools → Application → Local Storage

# 3. Test patient API
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5002/api/patients/medical-history

# Should return 200 OK, not 401
```

### Test 2: Check Service Logs
Services should log:
```
[AUTH] Verifying token with JWT_SECRET...
[AUTH] Token verified successfully for user: test@example.com
```

### Test 3: Frontend Should Work
- Log in → Get token ✅
- Navigate to dashboard → No 401 errors ✅
- API calls succeed ✅
