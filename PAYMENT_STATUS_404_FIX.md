# 404 Error: Payment Status Endpoint Not Found

## Problem
```
Failed to load resource: the server responded with a status of 404 (Not Found)
GET /api/payments/status/{paymentId} 
Error: Payment not initiated yet: Request failed with status code 404
```

## Root Causes & Solutions

### 1. **Payment Service Not Running** ⚠️
**Most Common Issue**

The payment service must be running on port 5005:
```bash
cd services/payment-service
npm install  # if first time
npm run dev
```

Check if running: `http://localhost:5005/health`

---

### 2. **API Gateway Not Running** ⚠️
The API Gateway (port 5000) routes all requests to backend services:
```bash
cd services/api-gateway
npm install
npm run dev
```

Check if running: `http://localhost:5000/health`

---

### 3. **Authentication Token Missing** ⚠️
The `GET /api/payments/status/:id` endpoint requires authentication. 

**Issue**: The request is being rejected because of missing or invalid JWT token.

**Solution**: Ensure token is being sent in request headers:
```javascript
// In frontend API calls
const response = await apiClient.get(`/api/payments/status/${appointmentId}`);
// apiClient automatically includes Authorization header
```

Check `frontend/src/services/apiClient.js`:
```javascript
// Should have:
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

---

### 4. **Wrong Endpoint Used** ❌
Some code might be calling wrong endpoint variations:

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `/api/payments/status/{appointmentId}` | `/api/payments/{paymentId}` |
| `/api/payments/patient/my` | `/api/payments/patient` |
| `/api/payments/admin` | `/api/payments/list` |

---

### 5. **Port Configuration Mismatch** ⚠️
Verify ports in API Gateway `server.js`:
```javascript
const serviceMap = {
  'payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',
  // Should match payment-service port!
};
```

Payment service port in `services/payment-service/src/server.js`:
```javascript
const PORT = process.env.PORT || 5005;  // Must be 5005
```

---

## Complete Troubleshooting Checklist

### Step 1: Verify Services Running
```bash
# Terminal 1: Payment Service
cd services/payment-service && npm run dev
# Should see: "Payment-Notification service running on port 5005"

# Terminal 2: API Gateway  
cd services/api-gateway && npm run dev
# Should see: "🚀 API Gateway v2 running on port 5000"

# Terminal 3: Frontend
cd frontend && npm run dev
# Should see: "VITE v... ready in ... ms"
```

### Step 2: Test Endpoints Directly
```bash
# Test payment service health
curl http://localhost:5005/health

# Test API Gateway
curl http://localhost:5000/health

# Test payment status endpoint (requires valid token)
curl -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  http://localhost:5000/api/payments/status/{appointmentId}
```

### Step 3: Check Frontend Token
Open browser DevTools → Application → LocalStorage:
- Key: `token`
- Value: Should contain JWT token (not empty)

If empty, user needs to log in first!

### Step 4: Check Network Request Headers
DevTools → Network tab → Click payment status request:
- **Headers** section should show:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

---

## Fix Implementation

### For Frontend (PaymentPage.jsx)
Ensure proper error handling:
```javascript
const loadPaymentDetails = async () => {
  try {
    // ... appointment fetch ...

    // Fetch payment status - with proper error handling
    try {
      const paymentResponse = await apiClient.get(
        `/api/payments/status/${appointmentId}`
      );
      setPayment(paymentResponse.data?.data);
    } catch (err) {
      // 404 is normal if payment not initiated yet
      if (err.response?.status === 404) {
        console.log("Payment not initiated yet (expected)");
        setPayment(null);
      } else if (err.response?.status === 401) {
        console.error("Authentication required - redirecting to login");
        navigate('/login');
      } else {
        console.error("Payment fetch error:", err);
        setError("Failed to load payment details");
      }
    }
  } catch (err) {
    console.error("Error loading payment details:", err);
  }
};
```

### For Backend (Payment Service)
Ensure endpoint is exported:
```javascript
// In paymentNotificationRoutes.js
router.get('/payments/status/:id', protect, getPaymentStatus);

// In paymentController.js
export const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try payment ID first, then appointment ID
    let payment = await Payment.findById(id);
    if (!payment) {
      payment = await Payment.findOne({ appointmentId: id });
    }
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        appointmentId: payment.appointmentId,
        status: payment.status,
        adminStatus: payment.adminStatus,
        amount: payment.amount,
        doctorName: payment.doctorName,
        transactionId: payment.transactionId,
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

---

## Expected Behavior

### Before Payment Initiated
- ✅ GET `/api/payments/status/{appointmentId}` returns **404**
- Frontend displays: "Not Initiated Yet" / "Ready to Pay" button
- This is **expected behavior**

### After Payment Initiated (Pending)
- ✅ GET `/api/payments/status/{appointmentId}` returns **200**
- Response includes:
```javascript
{
  success: true,
  data: {
    paymentId: "...",
    appointmentId: "...",
    status: "pending",
    adminStatus: "pending",
    amount: 3000,
    doctorName: "Dr. Smith",
    transactionId: null
  }
}
```

### After Payment Completed
- ✅ GET `/api/payments/status/{appointmentId}` returns **200**
- Response includes:
```javascript
{
  success: true,
  data: {
    paymentId: "...",
    appointmentId: "...",
    status: "completed",
    adminStatus: "pending",
    amount: 3000,
    doctorName: "Dr. Smith",
    transactionId: "TXN-..."
  }
}
```

---

## Common Error Messages & Fixes

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `404 Not Found` | Payment not initiated OR service offline | Start payment service, initiate payment |
| `401 Unauthorized` | Missing/invalid JWT token | User must log in |
| `502 Bad Gateway` | API Gateway can't reach payment service | Start payment service on 5005 |
| `CORS error` | Frontend URL not allowed | Check `cors({ origin: '...' })` in app.js |
| `Cannot GET /api/payments/status` | Routes not registered | Check route registration in app.js |

---

## Debug Mode

Add this to PaymentPage.jsx for detailed logging:
```javascript
useEffect(() => {
  console.log('[PaymentPage] Component mounted');
  console.log('[PaymentPage] appointmentId:', appointmentId);
  console.log('[PaymentPage] API Base URL:', import.meta.env.VITE_API_URL);
  console.log('[PaymentPage] User:', user);
  
  loadPaymentDetails();
}, [appointmentId]);

const loadPaymentDetails = async () => {
  console.log('[PaymentPage] loadPaymentDetails called');
  console.log('[PaymentPage] appointmentId:', appointmentId);
  
  try {
    const paymentRes = await apiClient.get(`/api/payments/status/${appointmentId}`);
    console.log('[PaymentPage] Payment status response:', paymentRes.data);
  } catch (err) {
    console.error('[PaymentPage] Payment status error:', {
      status: err.response?.status,
      message: err.response?.data?.message,
      url: err.config?.url,
      headers: err.config?.headers,
    });
  }
};
```

---

## Prevention

Always ensure before running frontend:
1. ✅ All backend services running
2. ✅ User is logged in (token in localStorage)
3. ✅ Correct appointment ID is being passed
4. ✅ Environment variables are correct (VITE_API_URL = http://localhost:5000)
