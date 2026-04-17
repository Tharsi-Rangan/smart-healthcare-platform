# Doctor Consultation Fee Integration

## Overview
The payment service now automatically fetches and uses the doctor's consultation fee from the doctor service when processing payments. This ensures payment amounts are always accurate and prevent unauthorized amount modifications.

## Changes Made

### 1. Payment Model Updates
Added new fields to track consultation fees:
- **consultationFee** (Number): Doctor's consultation fee in LKR (default: 500)
- **specialization** (String): Doctor's specialization for reference
- **adminNotes** (String): Admin notes for payment management

### 2. initiatePayment Endpoint
**Behavior Change:**
- No longer accepts `amount` as a required field
- Automatically fetches doctor details from doctor service
- Uses doctor's `consultationFee` as the payment amount
- Stores consultation fee for audit trail

**Request Example:**
```javascript
{
  appointmentId: "appt_123",
  doctorId: "doc_456",     // Required
  doctorName: "Dr. Smith",  // Optional (overridden by service)
  patientName: "John",
  patientEmail: "john@example.com",
  patientPhone: "+94771234567",
  paymentMethod: "payhere", // Optional
  currency: "LKR"           // Optional
}
```

**Note:** The `amount` field is no longer required or used. Payment amount is always set to the doctor's consultation fee.

### 3. Doctor Service Integration
- Endpoint: `GET http://localhost:5006/api/doctors/public/:doctorId`
- Fetches doctor details including consultation fee
- Timeout: 5 seconds
- Fallback: If doctor service is unavailable, uses request amount or default (500 LKR)

### 4. Payment Response
Payments now include consultation fee details:
```javascript
{
  _id: "payment_123",
  appointmentId: "appt_123",
  doctorId: "doc_456",
  doctorName: "Dr. Smith",
  specialization: "Cardiology",
  consultationFee: 3000,   // Doctor's fee
  amount: 3000,            // Payment amount
  status: "pending",
  adminStatus: "pending",
  createdAt: "2026-04-17T10:30:00Z",
  ...
}
```

## Frontend Impact

### Update Payment Initiation
If your frontend was sending custom amounts, update to:

```javascript
// BEFORE (no longer works as expected)
const data = {
  appointmentId: "...",
  doctorId: "...",
  amount: 5000, // This will be ignored
  patientName: "...",
  patientEmail: "...",
};

// AFTER (correct approach)
const data = {
  appointmentId: "...",
  doctorId: "...",
  // Amount is automatically fetched from doctor's consultation fee
  patientName: "...",
  patientEmail: "...",
};
```

### Display Consultation Fees
Use the `consultationFee` field from payment response:

```javascript
// In TransactionsPage or payment display
<p className="text-sm">
  Consultation Fee: {formatCurrency(payment.consultationFee)}
</p>
```

## Comparison: Payment Amount vs Consultation Fee

| Field | Purpose | When Set | Example |
|-------|---------|----------|---------|
| **consultationFee** | Doctor's standard rate | During payment initiation (from doctor service) | 3000 LKR |
| **amount** | Actual payment amount | Set to consultationFee at initiation | 3000 LKR |

Both are typically equal, but consultationFee serves as audit trail of the doctor's rate at time of payment.

## Error Handling

### Doctor Service Unavailable
If doctor service is unreachable:
1. Logs error to console
2. Falls back to request amount or default (500 LKR)
3. Payment is still created
4. Admin can see fallback values and correct if needed

### Invalid Doctor ID
- Doctor service returns 404
- Falls back to default consultation fee
- Payment status: "pending" (requires admin review)

## Admin Dashboard Impact
The TransactionsPage now displays:
- **Consultation Fee** column showing doctor's rate
- **Amount** column showing actual payment
- Clear audit trail in admin notes

## Migration Notes

### Existing Payments
- Do NOT need to be updated
- Consultation fees are only fetched for new payments
- Admin can manually add consultation fees for historical records if needed

### Testing
Test the integration:

1. Start doctor service: `cd services/doctor-service && npm run dev`
2. Start payment service: `cd services/payment-service && npm run dev`
3. Initiate payment without amount field
4. Verify doctor's consultation fee is used

## Future Enhancements
- [ ] Cache doctor consultation fees (reduce service calls)
- [ ] Support discounts/special rates
- [ ] Automatic consultation fee updates
- [ ] Payment fee breakdown in invoices
- [ ] Doctor earnings calculation
