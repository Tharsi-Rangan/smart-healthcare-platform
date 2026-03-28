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

---

## Base URL

### Local Development

```text
http://localhost:5002

Appointment Route Base
http://localhost:5002/api/appointments
```

---

## Authentication

All appointment routes are protected.

- use JWT issued by auth-service
- send token in header for every appointment request
- header format:

```http
Authorization: Bearer TOKEN
```

---

## Integration with Auth Service

Appointment service does not handle login or token generation.
It only validates the incoming JWT and reads user identity from token payload.

It reads these values from JWT:

- userId
- role

Example JWT payload:

```json
{
  "userId": "USER_ID",
  "email": "user@example.com",
  "role": "patient"
}
```

---

## Business Rules

- only `patient` role can create appointments
- only appointment owner can view/update/cancel/reschedule own records
- no double booking for same doctor + same date + same time
- appointment date/time must be in the future
- cancelled appointments cannot be cancelled again
- completed appointments cannot be cancelled or rescheduled
- cancelled appointments cannot be rescheduled

---

## Appointment Model Fields

Example appointment document:

```json
{
  "patientId": "USER_ID",
  "doctorId": "DOCTOR_ID",
  "specialty": "Cardiology",
  "appointmentDate": "2026-04-20T00:00:00.000Z",
  "appointmentTime": "14:30",
  "consultationType": "online",
  "reason": "Chest pain follow-up",
  "status": "pending",
  "paymentStatus": "unpaid"
}
```

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Keep response shape consistent across endpoints.

---

## API Endpoints

### 1. Create Appointment

**POST** `/api/appointments`

**Request Body**

```json
{
  "doctorId": "67f111111111111111111111",
  "specialty": "Cardiology",
  "appointmentDate": "2026-04-20",
  "appointmentTime": "14:30",
  "consultationType": "online",
  "reason": "Chest pain follow-up"
}
```

### 2. Get My Appointments

**GET** `/api/appointments/my`

No request body.

### 3. Get Appointment By ID

**GET** `/api/appointments/:id`

No request body.

### 4. Cancel Appointment

**PUT** `/api/appointments/:id/cancel`

No request body.

### 5. Reschedule Appointment

**PUT** `/api/appointments/:id/reschedule`

**Request Body**

```json
{
  "appointmentDate": "2026-04-25",
  "appointmentTime": "10:00"
}
```

---

## Protected Route Flow

1. client logs in through auth-service
2. auth-service returns JWT token
3. client sends token in `Authorization` header
4. appointment-service verifies token using shared `JWT_SECRET`
5. appointment-service extracts `userId` and `role`
6. request proceeds only if token and business rules are valid

---

## Role Behavior

Current appointment behavior uses patient identity from JWT:

- patient can create own appointment
- patient can fetch own appointments
- patient can update/cancel only own appointments
- role is validated from token payload in middleware and service checks

---

## Postman Test Order

1. login from auth-service and copy token
2. create appointment
3. attempt duplicate booking (same doctor/date/time)
4. get my appointments
5. reschedule appointment
6. cancel appointment

---

## Important Notes

- do not duplicate auth logic inside appointment-service
- use separate database for appointment-service: `appointment_service_db`
- do not use auth-service database name in appointment-service
- keep response format consistent across all endpoints

---

## Contact Point

All team members integrating with appointment APIs should follow this guide as the source of truth for request format, token usage, and business-rule expectations.
