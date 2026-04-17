# Payment & Telemedicine Integration - Complete Implementation Guide

## ✅ Completed Setup

### 1. Backend Updates

#### Payment Service (Payment.js)
- ✅ Added `adminStatus` field (pending, approved, rejected)
- ✅ Added `adminApprovedAt` timestamp
- ✅ Added `approvedBy` (admin ID)
- ✅ Added `rejectionReason` for transparency

#### Payment Controller (paymentController.js)
- ✅ `approvePayment()` - Admin approves payment, consultation becomes available
- ✅ `rejectPayment()` - Admin rejects payment with reason, payment refunded
- ✅ `getPaymentStatus()` - Check if payment approved (for front-end)

#### Payment Routes
- ✅ `GET /api/payments/:id/status` - Check payment status
- ✅ `PUT /api/payments/:id/approve` - Admin approves
- ✅ `PUT /api/payments/:id/reject` - Admin rejects

#### Consultation Service
- ✅ Created `consultation.model.js` - ConsultationSession schema
- ✅ Created `consultation.controller.js` - Twilio token generation
- ✅ `POST /api/consultation/video-token` - Generate video room token
- ✅ `GET /api/consultation/session/:appointmentId` - Get session details
- ✅ `PATCH /api/consultation/session/:id/end` - End session

---

### 2. Frontend Components

#### PayHere Payment Gateway
📁 `frontend/src/components/shared/PayHerePaymentGateway.jsx`
- Loads PayHere SDK
- Initiates payment on backend
- Shows "Pay Now" button
- Handles payment flow

#### Video Consultation Room
📁 `frontend/src/components/shared/VideoConsultationRoom.jsx`
- Twilio video integration
- Audio/video toggle controls
- End call button
- Participant list

#### Video Participant Display
📁 `frontend/src/components/shared/Participant.jsx`
- Renders individual video streams
- Handles audio/video tracks
- Shows local participant label

#### Admin Payment Approval Dashboard
📁 `frontend/src/pages/admin/AdminPaymentApprovalPage.jsx`
- View pending payments
- Approve/reject payments
- Add rejection reason
- View payment statistics

#### Payment & Consultation API Service
📁 `frontend/src/services/paymentConsultationApi.js`
- `initiatePayment()`
- `getPaymentStatus()`
- `approvePayment()` - Admin only
- `rejectPayment()` - Admin only
- `generateVideoToken()`
- `getConsultationSession()`
- `endConsultationSession()`

---

## 📋 Step-by-Step Implementation

### Step 1: Configure Environment Variables

**services/payment-service/.env**
```env
PAYHERE_MERCHANT_ID=1226148
PAYHERE_MERCHANT_SECRET=your_secret_here
PAYHERE_SANDBOX=true

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**services/consultation-service/.env**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
```

### Step 2: Update Appointment Model

Add `paymentId` field to appointment-service model:
```javascript
paymentId: { type: String, default: '' }
```

### Step 3: Register Routes

**consultation-service/src/app.js**
```javascript
import consultationRoutes from './routes/consultation.routes.js';
app.use('/api/consultation', consultationRoutes);
```

### Step 4: Update Frontend Routes

Add to `frontend/src/app/router/` for patient:
```javascript
{
  path: '/patient/video-consultation/:appointmentId',
  element: <VideoConsultationRoom />
}
```

Add to `frontend/src/app/router/` for admin:
```javascript
{
  path: '/admin/payments',
  element: <AdminPaymentApprovalPage />
}
```

### Step 5: Update Appointment Details Page

Show payment/consultation buttons based on status:
```javascript
{appointment.status === 'confirmed' && !appointment.paymentId && (
  <PayHerePaymentGateway
    appointmentId={appointment._id}
    amount={1500} // Consultation fee
    doctorName={appointment.doctorName}
    onSuccess={handlePaymentSuccess}
  />
)}

{appointment.paymentStatus === 'admin_approved' && (
  <button className="...">
    Start Video Consultation
  </button>
)}
```

---

## 🔄 Complete Appointment & Payment Flow

### Timeline:
```
1. Patient Books Appointment
   └─ Appointment Status: "pending"
   └─ Payment: None

2. Doctor Reviews & Accepts
   └─ Appointment Status: "confirmed"
   └─ Payment: None
   └─ 🔘 "Pay Now" button appears for patient

3. Patient Clicks "Pay Now"
   └─ PayHere payment modal opens
   └─ Payment Status: "pending"

4. Patient Completes Payment
   └─ PayHere processes payment
   └─ Payment Status: "completed"
   └─ Admin gets notification
   └─ 🔴 Consultation NOT available yet

5. Admin Reviews Payment
   └─ Admin goes to "Payment Approval" dashboard
   └─ Sees pending payment
   └─ Clicks "Approve"

6. Admin Approves
   └─ Payment Status: "admin_approved"
   └─ ✅ "Start Consultation" button appears
   └─ Patient receives notification

7. Patient Starts Video Call
   └─ Requests video token
   └─ Backend checks: payment status = "admin_approved" ✓
   └─ Generates Twilio token
   └─ Video room opens

8. Patient & Doctor Video Call
   └─ Real-time video, audio, screen sharing
   └─ Session recorded

9. Call Ends
   └─ Appointment Status: "completed"
   └─ Session archived
```

---

## 🛠️ API Endpoints Summary

### Patient Payment Flow:
```
POST   /api/payments/initiate
       → { appointmentId, doctorId, amount, ... }
       → Returns: { payment, payhereData }

GET    /api/payments/:id/status
       → Returns: { status, adminStatus, consultationAvailable }
```

### Admin Payment Flow:
```
GET    /api/payments/admin
       → Returns: All payments list

PUT    /api/payments/:id/approve
       → Admin approves payment
       → Consultation becomes available

PUT    /api/payments/:id/reject
       → Admin rejects with reason
       → Payment refunded
```

### Video Consultation:
```
POST   /api/consultation/video-token
       → { appointmentId, userName, userRole }
       → Verifies payment is approved
       → Returns: { token, roomName }

PATCH  /api/consultation/session/:id/end
       → Ends session, records duration
```

---

## 🔐 Security Considerations

1. **Payment Verification:**
   - Frontend always checks `paymentStatus === 'admin_approved'` before showing "Start Call"
   - Backend double-checks payment status on video token request
   - If status not approved, returns 403 Forbidden

2. **Twilio Security:**
   - JWT tokens expire in 1 hour
   - Each appointment gets unique room name
   - Participants verified via authentication

3. **Admin Approval:**
   - Only admins can approve/reject (role-based)
   - All actions logged with admin ID and timestamp
   - Email notifications sent to patients

---

## 📱 Frontend Components Location

```
frontend/
├── services/
│   └── paymentConsultationApi.js        (API calls)
├── components/shared/
│   ├── PayHerePaymentGateway.jsx        (Payment modal)
│   ├── VideoConsultationRoom.jsx        (Video room)
│   └── Participant.jsx                  (Video stream)
└── pages/
    ├── patient/
    │   └── AppointmentDetailsPage.jsx   (Updated with payment)
    └── admin/
        └── AdminPaymentApprovalPage.jsx (Payment approval)
```

---

## 🧪 Testing Checklist

### PayHere Testing:
- [ ] Patient initiates payment in sandbox mode
- [ ] PayHere payment gateway opens
- [ ] Complete payment with test card
- [ ] Webhook received by backend
- [ ] Payment status updates to "completed"
- [ ] Admin sees pending payment in dashboard
- [ ] Admin approves payment
- [ ] Patient notified of approval
- [ ] Consultation button becomes available

### Twilio Testing:
- [ ] Generate video token successfully
- [ ] Connect to video room
- [ ] Audio works both directions
- [ ] Video works both directions
- [ ] Screen sharing works
- [ ] Session ends properly
- [ ] Duration recorded

### Integration Testing:
```
✅ Doctor accepts appointment
✅ Patient sees "Pay Now" button
✅ Patient initiates payment
✅ PayHere payment completes
✅ Admin reviews pending payment
✅ Admin approves payment
✅ Patient sees "Start Consultation" button
✅ Patient clicks button
✅ Video room opens
✅ Doctor joins video
✅ Both can see/hear each other
✅ Call ends, appointment marked complete
```

---

## 🚀 Deployment Checklist

Before going to production:

1. **PayHere:**
   - [ ] Register production merchant account
   - [ ] Get live Merchant ID & Secret
   - [ ] Set PAYHERE_SANDBOX=false
   - [ ] Update return_url to production domain

2. **Twilio:**
   - [ ] Create production Twilio account
   - [ ] Get live API credentials
   - [ ] Set up webhook URLs

3. **Email:**
   - [ ] Configure production SMTP
   - [ ] Test email delivery

4. **Database:**
   - [ ] Backup payment records
   - [ ] Verify indexes on Payment collection

5. **Frontend:**
   - [ ] Update API base URL to production
   - [ ] Test all payment flows
   - [ ] Test video consultation

---

## 📞 Support & Troubleshooting

### PayHere Issues:
- Check merchant credentials in .env
- Verify webhook URL in PayHere dashboard
- Check PayHere logs for payment errors
- Test with sandbox credentials first

### Twilio Issues:
- Verify API credentials
- Check firewall allows media connections
- Test with both Chrome and Firefox
- Check browser console for errors

### Payment Not Appearing in Admin Dashboard:
- Verify payment webhook was received
- Check database for payment record
- Check payment status field

### Video Room Connection Issues:
- Verify Twilio credentials
- Check token hasn't expired
- Verify room name matches
- Check network connectivity

---

## 📚 Additional Resources

- PayHere Documentation: https://www.payhere.lk/developer
- Twilio Video Documentation: https://www.twilio.com/docs/video
- Twilio JWT: https://www.twilio.com/docs/video/tutorials/user-identity-access-tokens

---

## 🎯 Next Phase Enhancements

1. **Payment Receipts:**
   - PDF invoice generation
   - Email receipt with details

2. **Video Recording:**
   - Enable session recording
   - Store in cloud storage
   - Allow playback for doctor

3. **Payment Plans:**
   - Package pricing
   - Subscription options
   - Bulk discounts

4. **Analytics:**
   - Revenue reports
   - Consultation duration analytics
   - Patient/doctor rating system

5. **Refunds:**
   - Self-service refund requests
   - Admin refund processing
   - Partial refunds

---

All files are ready for testing and deployment! 🚀
