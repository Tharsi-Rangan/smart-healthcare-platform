# Appointment Service Integration Guide

## Purpose

This document explains how other team members should use the Appointment Service in the Smart Healthcare Platform.

The Appointment Service is responsible for:

- creating appointments
- viewing appointments
- cancelling appointments
- rescheduling appointments
- preventing double booking
- enforcing appointment business rules
- doctor-side appointment management (view + status updates)

---

## Base URL

### Local Development

http://localhost:5003

### Appointment Route Base

http://localhost:5003/api/appointments

---

## Authentication

All appointment routes are protected.

- use JWT issued by auth-service
- send token in header for every request

Authorization: Bearer TOKEN

---

## Integration with Auth Service

Appointment service does not handle login or token generation.

It only:

- verifies JWT
- extracts user info

### Required JWT fields

{
  "userId": "USER_ID",
  "role": "patient | doctor"
}

Note: `email` may exist in the token, but appointment-service currently requires only `userId` and `role`.

---

## Business Rules

### General Rules

- appointment date + time must be in the future
- no double booking for same doctor + date + time
- response format must be consistent

---

### Patient Rules

- only `patient` role can:
  - create appointments
  - view own appointments
  - cancel own appointments
  - reschedule own appointments

- patient can only access their own appointments

---

### Doctor Rules

- only `doctor` role can:
  - view own appointments
  - update appointment status

- doctor can only access appointments where:
  appointment.doctorId === logged-in doctor userId

---

### Status Rules

- allowed update payload values for doctor status updates:
  - confirmed
  - completed

- current implementation rule:
  - status updates are blocked only when appointment is already `cancelled`

- cannot:
  - reschedule cancelled appointment
  - cancel completed appointment
  - update appointment of another doctor

---

## Appointment Model Fields

{
  "patientId": "USER_ID",
  "doctorId": "DOCTOR_ID",
  "specialty": "Cardiology",
  "appointmentDate": "2026-04-20T00:00:00.000Z",
  "appointmentTime": "14:30",
  "consultationType": "online",
  "reason": "Chest pain follow-up",
  "status": "pending",
  "paymentStatus": "pending"
}

---

## Standard Response Format

### Success

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

### Error

{
  "success": false,
  "message": "Error message",
  "data": null
}

Validation errors can also include:

{
  "errors": [
    {
      "type": "field",
      "path": "appointmentDate",
      "msg": "appointmentDate must be in YYYY-MM-DD format"
    }
  ]
}

---

## API Endpoints

---

### PATIENT ROUTES

---

### 1. Create Appointment

POST /api/appointments

{
  "doctorId": "DOCTOR_ID",
  "specialty": "Cardiology",
  "appointmentDate": "2026-04-20",
  "appointmentTime": "14:30",
  "consultationType": "online",
  "reason": "Chest pain follow-up"
}

---

### 2. Get My Appointments

GET /api/appointments/my

---

### 3. Get Appointment By ID

GET /api/appointments/:id

---

### 4. Cancel Appointment

PUT /api/appointments/:id/cancel

---

### 5. Reschedule Appointment

PUT /api/appointments/:id/reschedule

{
  "appointmentDate": "2026-04-25",
  "appointmentTime": "10:00"
}

---

## DOCTOR ROUTES

---

### 6. Get Doctor Appointments

GET /api/appointments/doctor/my

---

### 7. Update Appointment Status

PUT /api/appointments/:id/status

{
  "status": "confirmed"
}

Allowed values:
- confirmed
- completed

---

## Protected Route Flow

1. client logs in via auth-service
2. receives JWT token
3. sends token in header
4. appointment-service verifies JWT
5. extracts:
   - userId
   - role
6. applies role + ownership checks

---

## Role Behavior Summary

| Action | Patient | Doctor |
|--------|--------|--------|
| Create appointment | ✅ | ❌ |
| View own appointments | ✅ | ❌ |
| Cancel appointment | ✅ | ❌ |
| Reschedule appointment | ✅ | ❌ |
| View doctor appointments | ❌ | ✅ |
| Update appointment status | ❌ | ✅ |

---

## Postman Test Order

### Patient Flow

1. login (patient)
2. create appointment
3. duplicate booking test
4. get my appointments
5. reschedule appointment
6. cancel appointment

---

### Doctor Flow

1. login (doctor)
2. get doctor appointments
3. update appointment status (confirmed)
4. update appointment status (completed)

---

## Important Notes

- do NOT implement auth logic here
- always use auth-service token
- use correct database: appointment_service_db
- NEVER use auth_db here
- use real doctor userId when testing doctor endpoints

---

## Common Mistakes (IMPORTANT)

❌ Using fake doctorId  
✔ Always use real doctor userId from auth-service  

❌ Using patient token for doctor endpoints  
✔ Use doctor token for:
- /doctor/my
- /:id/status  

❌ Sending body as Text instead of JSON  
✔ Always use raw → JSON in Postman  

---

## Contact Point

All team members integrating with appointment APIs must follow this document as the single source of truth for:

- request formats
- JWT usage
- role-based access
- business rules