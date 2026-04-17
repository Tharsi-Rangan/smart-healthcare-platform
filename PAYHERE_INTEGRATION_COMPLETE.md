# Complete PayHere Payment Integration System Documentation

## System Overview

This document describes the complete, production-ready PayHere payment integration for the Smart Healthcare Platform telemedicine system. The implementation follows a secure workflow ensuring payments are verified and approved before consultation access is granted.

## Complete Payment Workflow

```
1. BOOKING STAGE
   ├─ Patient books appointment → Doctor selects
   └─ Appointment created with status: "pending"

2. DOCTOR CONFIRMATION
   ├─ Doctor accepts appointment → Status changes to "confirmed"
   └─ "Pay Now" button appears in patient's MyAppointments page

3. PAYMENT INITIATION
   ├─ Patient clicks "Pay Now" → Redirected to /payment/{appointmentId}
   ├─ PaymentPage loads appointment & payment details
   └─ Patient clicks "Proceed to PayHere"

4. PAYHERE PAYMENT
   ├─ PayHere SDK initializes with payment data
   ├─ Patient enters payment details (Card/Mobile money)
   ├─ PayHere processes transaction securely
   └─ Success/Failure callback received

5. PAYMENT CONFIRMATION
   ├─ Backend receives webhook notification
   ├─ Payment record created with status: "completed"
   └─ Payment awaits admin approval (status: "pending")

6. ADMIN APPROVAL
   ├─ Admin reviews in AdminPaymentApprovalPage
   ├─ Admin clicks "Approve" → Payment admin status: "approved"
   └─ Patient notified of approval

7. CONSULTATION ACCESS
   ├─ Patient can now join video consultation
   ├─ Both doctor and patient verify payment approved status
   └─ Jitsi room opens for real-time consultation

8. POST-CONSULTATION
   ├─ Doctor issues prescription
   ├─ Appointment marked as "completed"
   └─ Patient can view prescription and receipt
```

## Architecture

### Frontend Components

#### 1. **PaymentPage** (`frontend/src/pages/shared/PaymentPage.jsx`)
**Purpose:** Handle payment initiation and status tracking

**Key Features:**
- Loads appointment details from backend
- Fetches payment status to check if payment already initiated
- Initiates payment via `/api/payments/initiate` endpoint
- Handles PayHere SDK initialization
- Displays payment status (pending, completed, admin_approved, rejected)
- Shows clear messaging for each state:
  - **Pending:** Shows "Initiate Payment" button
  - **Completed:** Shows "Awaiting Admin Approval" with refresh button
  - **Admin Approved:** Shows "Start Consultation" button
  - **Admin Rejected:** Shows rejection reason and retry option

**Payment States:**
```javascript
- isPaymentCompleted: payment?.status === "completed"
- isAdminApproved: payment?.adminStatus === "approved"
- isAdminRejected: payment?.adminStatus === "rejected"
- isAwaitingApproval: payment?.status === "completed" && payment?.adminStatus === "pending"
```

**API Endpoints Used:**
- `GET /api/appointments/{appointmentId}` - Load appointment details
- `GET /api/payments/status/{appointmentId}` - Check payment status
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/confirm` - Confirm payment (test mode)

#### 2. **AdminPaymentApprovalPage** (`frontend/src/pages/admin/AdminPaymentApprovalPage.jsx`)
**Purpose:** Admin dashboard for reviewing and approving/rejecting payments

**Key Features:**
- Displays all payments with filtering by status
- Search capability (patient name, doctor name, appointment ID, transaction ID)
- Sorting by date or amount
- Real-time stats showing pending/approved/rejected counts
- Modal showing detailed payment information
- Approve button with confirmation
- Reject button with reason input (required)
- Shows approved total amount

**API Endpoints Used:**
- `GET /api/payments/admin` - Get all payments
- `PUT /api/payments/{id}/approve` - Approve payment
- `PUT /api/payments/{id}/reject` - Reject with reason

#### 3. **ConsultationPage** (`frontend/src/pages/shared/ConsultationPage.jsx`)
**Purpose:** Patient-side consultation access with payment verification

**Enhanced Join Logic:**
1. Check appointment status === "confirmed"
2. **NEW:** Check payment status
   - Must exist and be "completed"
   - Admin status must be "approved"
3. Validate appointment date is today
4. Validate current time within session window (30 min before to 2 hours after)
5. Notify doctor of join
6. Open Jitsi room

**Error Messages:**
- Appointment not confirmed: "Your appointment is not yet confirmed"
- Payment not found: Redirect to payment page
- Payment not approved: "Awaiting admin approval"
- Payment rejected: Show rejection reason
- Wrong date: "Can only join on appointment date"
- Outside window: "Can join 30 min before to 2 hours after"

#### 4. **VideoSessionPage** (`frontend/src/pages/doctor/VideoSessionPage.jsx`)
**Purpose:** Doctor-side consultation management with payment verification

**Enhanced Start Session Logic:**
1. Check appointment status === "confirmed"
2. **NEW:** Check payment status
   - Must exist and be "completed"
   - Admin status must be "approved"
3. Validate appointment date is today
4. Validate current time within session window
5. Start consultation on backend
6. Notify patient session started
7. Open Jitsi room

**Doctor Alerts:**
- "Payment not yet completed - patient must pay first"
- "Payment rejected by admin - patient needs to retry"
- "Payment awaiting admin approval - check back soon"

### Backend Services

#### 1. **Payment Service** (`services/payment-service/`)

**Payment Model** (`src/models/Payment.js`)
```javascript
{
  appointmentId: String,      // Links to appointment
  patientId: String,          // Patient making payment
  patientName: String,        // For receipt
  patientEmail: String,
  patientPhone: String,
  doctorId: String,           // Doctor receiving payment
  doctorName: String,
  amount: Number,             // LKR
  currency: String,           // Default: LKR
  paymentMethod: String,      // "payhere", "stripe", etc.
  status: String,             // "pending", "completed", "failed", "refunded"
  adminStatus: String,        // "pending", "approved", "rejected"
  transactionId: String,      // PayHere transaction ID
  paymentData: Object,        // Full PayHere response
  paidAt: Date,              // When payment completed
  adminApprovedAt: Date,     // When admin approved
  approvedBy: String,        // Admin ID
  rejectionReason: String,   // Why rejected (admin)
  createdAt: Date,
  updatedAt: Date
}
```

**Key Endpoints:**

**`POST /api/payments/initiate`**
- Checks for existing completed payment (prevents duplicates)
- Creates payment record with status: "pending"
- Generates PayHere checkout data with:
  - Merchant ID and credentials
  - Order ID (payment._id)
  - Amount, currency
  - Return/Cancel/Notify URLs
  - MD5 hash for security
- Returns both payment record and PayHere data

**`POST /api/payments/notify` (PayHere Webhook)**
- Receives payment status from PayHere
- Validates PayHere signature
- Updates payment status to "completed"
- Sends notification to patient
- No authentication required (webhook from PayHere)

**`GET /api/payments/status/{appointmentId}`**
- Returns payment record for appointment
- Shows current status and admin status
- Patient/Doctor can check anytime
- Requires authentication

**`GET /api/payments/patient/my`**
- Returns all payments for authenticated patient
- Patient role required
- Shows payment history with receipt

**`GET /api/payments/admin`**
- Returns all payments for admin review
- Admin role required
- Shows pending payments first

**`PUT /api/payments/{id}/approve`**
- Admin approves payment
- Sets adminStatus: "approved"
- Records admin ID and timestamp
- Admin role required

**`PUT /api/payments/{id}/reject`**
- Admin rejects payment
- Sets adminStatus: "rejected"
- Stores rejectionReason
- Patient can retry payment
- Admin role required

#### 2. **Appointment Service** (`services/appointment-service/`)

**Key Model Updates:**
```javascript
{
  status: ["pending", "confirmed", "cancelled", "completed"],
  // "pending" = awaiting admin confirmation
  // "confirmed" = admin confirmed, patient can pay
  // "cancelled" = user cancelled
  // "completed" = consultation finished
}
```

**Endpoint Updates:**
- `PUT /api/appointments/{id}/confirm` - Admin confirms appointment (changes status to "confirmed")
- `GET /api/appointments/doctor/my` - Doctor gets their appointments
- Both endpoints return appointments with status and consultationType

#### 3. **Consultation Service** (`services/consultation-service/`)

**Requirements:**
- Verify payment adminStatus === "approved" before allowing video token generation
- Start session only for confirmed appointments
- End session and mark appointment as completed

#### 4. **Payment Webhook Handler**

**PayHere Webhook Configuration:**
- URL: `http://localhost:5000/api/payments/notify`
- Receives POST with payment status updates
- Must validate PayHere signature for security

**Webhook Response:**
```javascript
{
  status: "success",
  order_id: "{payment._id}",
  merchant_id: "{PAYHERE_MERCHANT_ID}",
  payment_id: "{PAYHERE_PAYMENT_ID}",
  payhere_amount: "{amount}",
  payhere_currency: "LKR",
  status_code: 2,  // 2 = Success
  sign: "{md5_hash}"
}
```

## PayHere Integration

### Merchant Credentials

**Environment Variables Required:**
```bash
# Backend (.env in payment-service)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX=false (set to 'true' for testing)

# PayHere Settings in dashboard:
- Return URL: http://localhost:3000/payment-return
- Cancel URL: http://localhost:3000/patient/payments
- Notify URL: http://localhost:5000/api/payments/notify
```

### PayHere Sandbox Testing

**Sandbox Merchant Credentials:**
```
Merchant ID: 1226148
Merchant Secret: [provided by PayHere]
Sandbox Mode: Set PAYHERE_SANDBOX=true
```

**Test Card Numbers:**
- Visa: 4111111111111111 (any future date, any CVV)
- MasterCard: 5555555555554444
- Expiry: Any future date (MM/YY)
- CVV: Any 3 digits

### PayHere Payment Flow

1. **Client-Side (Frontend):**
   ```javascript
   // Load PayHere SDK in HTML
   <script src="https://www.payhere.lk/pay/payhere-web-sdk/js/payhere.js"></script>
   
   // Initiate payment
   payhere.startPayment(payhereData);
   
   // Handle callbacks
   payhere.onCompleted = function(orderId) { /* success */ }
   payhere.onDismissed = function() { /* cancelled */ }
   payhere.onError = function(error) { /* error */ }
   ```

2. **Server-Side (Backend):**
   ```javascript
   // Receive webhook notification
   POST /api/payments/notify
   {
     order_id,
     merchant_id,
     status_code,
     sign (MD5 hash)
   }
   
   // Validate signature
   const hash = MD5(merchant_id + order_id + amount + currency + secret)
   if (hash !== sign) { throw new Error('Invalid signature') }
   
   // Update payment
   payment.status = "completed"
   payment.transactionId = payhere_payment_id
   await payment.save()
   ```

## Security Implementation

### 1. **Payment Authentication**
- All payment endpoints except webhook require JWT authentication
- Bearer token validates user identity
- User ID extracted from token payload

### 2. **Payment Signature Validation**
- PayHere uses MD5 hash signing
- Backend validates all webhook notifications
- Formula: `MD5(merchant_id + order_id + amount + currency + merchant_secret)`

### 3. **Access Control**
- Payment endpoints role-restricted:
  - `/patient/my` → Patient role only
  - `/admin` → Admin role only
  - `/approve`, `/reject` → Admin role only

### 4. **Consultation Access Control**
- Payment must be admin approved before consultation accessible
- Both doctor and patient verify payment status before session start
- Prevents unpaid consultations

### 5. **Error Handling**
- All endpoints validate required fields
- Proper HTTP status codes returned
- Sensitive errors logged, generic messages to client
- No stack traces exposed to client

## Deployment Checklist

### Pre-Deployment

- [ ] Set environment variables in production
- [ ] Obtain PayHere merchant credentials
- [ ] Configure PayHere webhook URLs in dashboard
- [ ] Update API URLs from localhost to production domain
- [ ] Test payment flow with sandbox credentials
- [ ] Set PAYHERE_SANDBOX=false in production
- [ ] Enable HTTPS for all payment endpoints
- [ ] Test admin payment approval workflow
- [ ] Test consultation access after approval
- [ ] Set up email notifications for payments

### Post-Deployment

- [ ] Verify PayHere webhook is receiving notifications
- [ ] Test end-to-end payment flow
- [ ] Monitor payment logs
- [ ] Verify admin dashboard loads all payments
- [ ] Test payment rejection and retry
- [ ] Test consultation access gating
- [ ] Document production payment troubleshooting

## Testing Guide

### Manual Testing Workflow

**1. Test Patient Payment:**
- Login as patient
- Book appointment with confirmed doctor
- Verify "Pay Now" button appears
- Click "Pay Now" → PaymentPage loads
- Click "Proceed to PayHere"
- Use sandbox credentials to complete payment
- Verify payment status shows "Completed"

**2. Test Admin Approval:**
- Login as admin
- Go to AdminPaymentApprovalPage
- Verify pending payments show
- Click "Review" on a payment
- Click "Approve"
- Verify adminStatus changes to "approved"

**3. Test Consultation Access:**
- Login as patient
- Go to ConsultationPage
- Try to join consultation
- Verify it checks payment status
- After admin approval, verify can join
- Try with unpaid appointment, verify redirect to payment

**4. Test Error Scenarios:**
- Rejected payment → Show reason, allow retry
- Payment timeout → Show waiting message
- Doctor starts before payment approved → Show warning
- Patient joins before confirmed → Block with message

## Troubleshooting

### Common Issues

**Issue: "PayHere SDK not loaded"**
- Solution: Verify PayHere script tag in HTML head
- Check browser console for script errors
- Ensure PayHere CDN is accessible

**Issue: "Payment status check failing"**
- Solution: Verify payment record created
- Check payment service logs
- Ensure JWT token is valid

**Issue: "Webhook notifications not received"**
- Solution: Verify notify URL configured in PayHere dashboard
- Check firewall allows incoming connections
- Verify endpoint is publicly accessible
- Test with PayHere sandbox

**Issue: "Payment shows completed but admin doesn't see it"**
- Solution: Verify payment service and admin service on same database
- Check payment record has adminStatus field
- Verify admin user has correct role

## Future Enhancements

1. **Multiple Payment Methods**
   - Stripe integration
   - Dialog mobile money
   - Bank transfers

2. **Refund Processing**
   - Admin can issue refunds
   - Automatic refund on consultation cancellation
   - Partial refunds for rescheduled appointments

3. **Payment Receipts**
   - Email receipts after approval
   - PDF invoice generation
   - Tax reporting

4. **Analytics**
   - Payment revenue reports
   - Doctor earnings dashboard
   - Transaction history with filters

5. **Notifications**
   - Email on payment completion
   - SMS on admin approval
   - Reminders for pending payments

## Support & Documentation

For PayHere integration details: https://www.payhere.lk/
For questions: contact@payhere.lk
For support issues: Check payment service logs and webhook logs

---

**Last Updated:** 2024
**Version:** 1.0 - Production Ready
