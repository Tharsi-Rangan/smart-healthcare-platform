# Symptom Checker Service Integration Guide

## Purpose

This document explains how team members should use the Symptom Checker Service in the Smart Healthcare Platform.

The Symptom Checker Service is responsible for:

- analyzing patient symptoms
- recommending a doctor specialty
- classifying urgency (Low, Medium, High)
- generating safe preliminary guidance and home-care tips
- storing symptom analysis history
- deleting one or all symptom history records

---

## Base URL

### Local Development

http://localhost:5007

### Route Base

http://localhost:5007/api/symptoms

---

## Authentication and Authorization

All symptom-checker routes are protected.

- use JWT issued by auth-service
- send token in header for every request

Authorization: Bearer TOKEN

### Required JWT fields

{
  "userId": "USER_ID",
  "role": "patient"
}

### Role restriction

All routes require `patient` role.

---

## Service Behavior

### AI + Fallback Flow

1. Service tries Gemini API analysis first.
2. If Gemini fails (timeout, key issue, parse issue), service falls back to rule-based analysis.
3. The final analysis is always saved in MongoDB.
4. Response includes disclaimer and analysis source (`gemini` or `rule-based`).

### Specialty normalization

The service always normalizes recommendations to one allowed specialty:

- Cardiology
- Dermatology
- Pediatrics
- Neurology
- General Physician
- Orthopedics
- ENT
- Psychiatry
- Gynecology

---

## Request Validation Rules

### POST /analyze

Required:

- symptoms: string, length 3..1000

Optional:

- duration: string, max 100
- severity: one of `low`, `medium`, `high`
- ageGroup: string, max 50

### DELETE /:id

- id must be a valid MongoDB ObjectId

---

## Data Model (Stored Record)

{
  "userId": "ObjectId",
  "symptoms": "string",
  "duration": "string",
  "severity": "low | medium | high | ''",
  "ageGroup": "string",
  "recommendedSpecialty": "string",
  "urgency": "Low | Medium | High",
  "preliminarySuggestion": "string",
  "homeCareTips": ["string"],
  "whenToSeekHelp": "string",
  "isEmergency": false,
  "source": "gemini | rule-based",
  "apiRawResponse": {},
  "createdAt": "date",
  "updatedAt": "date"
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

Validation failures can also include:

{
  "errors": [
    {
      "type": "field",
      "path": "symptoms",
      "msg": "symptoms is required"
    }
  ]
}

---

## API Endpoints

### 1. Analyze Symptoms

POST /api/symptoms/analyze

Request:

{
  "symptoms": "Chest pain and shortness of breath for 2 days",
  "duration": "2 days",
  "severity": "high",
  "ageGroup": "adult"
}

Success response fields in `data`:

- _id
- userId
- symptoms
- duration
- severity
- ageGroup
- recommendedSpecialty
- urgency
- preliminarySuggestion
- homeCareTips
- whenToSeekHelp
- isEmergency
- source
- createdAt
- updatedAt
- disclaimer

---

### 2. Get My Symptom History

GET /api/symptoms/history

Returns all records for logged-in patient, newest first.

---

### 3. Delete All My Symptom History

DELETE /api/symptoms/history

Deletes every symptom analysis record for logged-in patient.

---

### 4. Delete Symptom Record by ID

DELETE /api/symptoms/:id

Deletes one record if it belongs to the logged-in patient.

---

## Ownership and Access Rules

- patient can only read/delete their own records
- deleting another patient's record returns `403 Forbidden`
- deleting non-existing record returns `404 Symptom record not found`

---

## Protected Route Flow

1. client logs in via auth-service
2. receives JWT token
3. sends token in header
4. symptom-checker verifies JWT
5. extracts userId + role
6. enforces role: patient only
7. executes request logic

---

## Postman Test Order

1. login as patient and copy token
2. analyze symptoms (valid body)
3. analyze symptoms (invalid body to verify validation)
4. get history
5. delete one record by id
6. delete all history
7. get history again (should be empty)

---

## Environment Variables

Required:

- PORT (default in code: 5007)
- MONGO_URI
- JWT_SECRET (must match auth-service shared secret)
- GEMINI_API_KEY

Optional:

- GEMINI_MODEL (default: `gemini-2.5-flash`)

---

## Important Notes

- this is an AI-assisted triage helper, not a diagnosis engine
- never treat output as final medical diagnosis
- never return medicine dosage or unsafe treatment advice
- always keep auth-service as token issuer (no login logic here)

---

## Common Mistakes

- Using doctor/admin token
  - use patient token only

- Sending severity as `High`/`Medium`/`Low`
  - request severity must be lowercase: `high`, `medium`, `low`

- Sending empty symptoms
  - symptoms is required and must be at least 3 characters

- Expecting Gemini-only output
  - service may fallback to rule-based analysis if Gemini fails

---

## Contact Point

All team members integrating symptom-checker APIs should use this file as the source of truth for:

- request formats
- auth usage
- role restrictions
- AI/fallback behavior
- history lifecycle
