# Appointment Service Integration Guide

## Purpose

This document is the current integration reference for the Appointment Service.

The Appointment Service handles:

- creating appointments
- listing patient appointments
- getting one appointment by id (patient ownership only)
- cancelling/rescheduling patient appointments
- listing doctor appointments
- doctor status updates (confirmed/completed)
- admin review endpoints (pending, all, stats)
- admin confirmation of paid appointments
- double-booking prevention by doctor + date + time

---

## Base URLs

### Direct service (local)

http://localhost:5003

### Direct route base

http://localhost:5003/api/appointments

### Through API Gateway (recommended for frontend)

http://localhost:5000/api/appointments

---

## Authentication

All routes are protected with JWT.

Authorization header:

Authorization: Bearer TOKEN

### Required JWT payload fields

{
  "userId": "USER_ID",
  "role": "patient | doctor | admin"
}

---

## Role Rules

### Patient role

Allowed:

- POST /api/appointments
- GET /api/appointments/my
- GET /api/appointments/:id (own only)
- PUT /api/appointments/:id/cancel (own only)
- PUT /api/appointments/:id/reschedule (own only)

### Doctor role

Allowed:

- GET /api/appointments/my
- GET /api/appointments/doctor/my
- PUT /api/appointments/:id/status

### Admin role

Allowed:

- GET /api/appointments/admin/pending
- GET /api/appointments/admin/stats
- GET /api/appointments/admin/all
- PUT /api/appointments/:id/confirm

---

## Business Rules

- appointment date + time must be in the future
- no double-booking on same doctor/date/time unless existing booking is cancelled
- patient cannot cancel completed appointments
- patient cannot cancel already cancelled appointments
- patient cannot reschedule cancelled or completed appointments
- doctor can update status only for their own appointments
- doctor can set status only to `confirmed` or `completed`
- doctor cannot update cancelled appointments
- rescheduling resets status to `pending`
- admin confirmation is allowed only when appointment status is `confirmed` and paymentStatus is `paid`

---

## Current Data Model

Stored appointment document:

{
  "patientId": "ObjectId",
  "doctorId": "ObjectId",
  "doctorAuthUserId": "string",
  "specialty": "string",
  "patientName": "string",
  "doctorName": "string",
  "appointmentDate": "Date",
  "appointmentTime": "HH:mm",
  "consultationType": "online | offline",
  "consultationFee": "number (default: 500)",
  "reason": "string",
  "patientDetails": {
    "fullName": "string",
    "phone": "string",
    "address": "string"
  },
  "status": "pending | confirmed | cancelled | completed",
  "paymentStatus": "pending | paid | failed",
  "adminConfirmed": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}

---

## Validation Rules

### Create appointment (POST /api/appointments)

Required:

- doctorId: valid MongoDB id
- specialty: string, 2..100
- appointmentDate: YYYY-MM-DD valid date
- appointmentTime: HH:mm and future with appointmentDate
- reason: string, 5..500
- patientDetails.fullName: string, 2..120
- patientDetails.phone: string, 7..20
- patientDetails.address: string, 5..250

Optional:

- consultationType: `online` or `offline`
- doctorAuthUserId: string (service also tries to resolve from doctor-service if not sent)
- doctorName: string (service also tries to resolve from doctor-service if not sent)
- consultationFee: number (falls back to 500)

### Reschedule (PUT /api/appointments/:id/reschedule)

Required:

- appointmentDate (valid, future)
- appointmentTime (valid, future)

### Doctor status update (PUT /api/appointments/:id/status)

Required:

- status: `confirmed` or `completed`

### Admin list/filter (GET /api/appointments/admin/all)

Optional query params:

- status: `all | pending | confirmed | completed | cancelled`
- patientName: string (contains, case-insensitive)
- doctorName: string (contains, case-insensitive)
- page: number (default 1)
- limit: number (default 15, max 50)

### Admin confirm (PUT /api/appointments/:id/confirm)

Rules:

- appointment must exist
- appointment status must be `confirmed`
- paymentStatus must be `paid`

---

## API Endpoints

### Patient

1. POST /api/appointments
2. GET /api/appointments/my
3. GET /api/appointments/:id
4. PUT /api/appointments/:id/cancel
5. PUT /api/appointments/:id/reschedule

### Doctor

6. GET /api/appointments/my
7. GET /api/appointments/doctor/my
8. PUT /api/appointments/:id/status

### Admin

9. GET /api/appointments/admin/pending
10. GET /api/appointments/admin/stats
11. GET /api/appointments/admin/all
12. PUT /api/appointments/:id/confirm

---

## Create Appointment Example (Current)

{
  "doctorId": "69cdec3ff82f6960d49dc41a",
  "specialty": "cardiologist",
  "appointmentDate": "2026-04-19",
  "appointmentTime": "16:14",
  "consultationType": "online",
  "reason": "heavy fever",
  "patientDetails": {
    "fullName": "Tharsiga Ranganathan",
    "phone": "0771234567",
    "address": "No 10, Main Street, Jaffna"
  }
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

Validation failures include:

{
  "message": "Validation failed",
  "errors": [
    {
      "path": "patientDetails.fullName",
      "msg": "patientDetails.fullName is required"
    }
  ]
}

---

## Important Notes

- Appointment Service does not issue tokens; always use auth-service token.
- Frontend should prefer API Gateway route base (`http://localhost:5000/api/appointments`).
- Older appointment records created before `patientDetails` became mandatory may not contain that object.
- Older appointment records may also miss newer fields (for example `consultationFee`), and controllers currently normalize missing fees to `500` in list/detail responses.

---

## Quick Test Order

1. Login as patient and copy token.
2. Create appointment with required `patientDetails`.
3. Get my appointments.
4. Reschedule and cancel one appointment.
5. Login as doctor.
6. Get doctor/my and update status.
