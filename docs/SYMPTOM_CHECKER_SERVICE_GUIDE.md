# Symptom Checker Service Integration Guide

## Purpose

This document is the current integration reference for Symptom Checker Service.

The service handles:

- symptom analysis
- urgency classification (Low/Medium/High)
- specialty recommendation
- AI-first + rule-based fallback behavior
- symptom history retrieval
- deleting one or all history records

---

## Base URLs

### Direct service (local)

http://localhost:5007

### Direct route base

http://localhost:5007/api/symptoms

### Through API Gateway (recommended for frontend)

http://localhost:5000/api/symptoms

---

## Authentication and Role

All routes require JWT and patient role.

Authorization header:

Authorization: Bearer TOKEN

Required JWT fields:

{
  "userId": "USER_ID",
  "role": "patient"
}

---

## Current Routes

1. POST /api/symptoms/analyze
2. GET /api/symptoms/history
3. DELETE /api/symptoms/history
4. DELETE /api/symptoms/:id

Health check:

- GET /health

---

## Validation Rules

### Analyze (POST /analyze)

Required:

- symptoms: string, 3..1000

Optional:

- duration: string, max 100
- severity: `low` | `medium` | `high`
- ageGroup: string, max 50

### Delete one by id

- id must be a valid MongoDB id

---

## AI + Fallback Behavior

1. Service tries Gemini first.
2. If Gemini fails or returns unparsable output, service falls back to rule-based logic.
3. Response is still returned successfully and record is saved.
4. Response includes `source` and `disclaimer`.

Current source values in model:

- `gemini`
- `rule-based`
- `endlessmedical` (enum supported in schema)

---

## Specialty Normalization

Output specialty is normalized to one of:

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

## Stored Record Shape

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
  "source": "gemini | rule-based | endlessmedical",
  "apiRawResponse": {},
  "createdAt": "date",
  "updatedAt": "date"
}

---

## Analyze Request Example

{
  "symptoms": "Chest pain and shortness of breath for 2 days",
  "duration": "2 days",
  "severity": "high",
  "ageGroup": "adult"
}

## Analyze Success Response (data)

{
  "_id": "...",
  "userId": "...",
  "symptoms": "...",
  "duration": "...",
  "severity": "...",
  "ageGroup": "...",
  "recommendedSpecialty": "Cardiology",
  "urgency": "High",
  "preliminarySuggestion": "...",
  "homeCareTips": ["..."],
  "whenToSeekHelp": "...",
  "isEmergency": true,
  "source": "gemini",
  "createdAt": "...",
  "updatedAt": "...",
  "disclaimer": "This is a preliminary AI-assisted suggestion and not a medical diagnosis."
}

---

## Ownership Rules

- patient can access only their own records
- deleting other user's record returns 403
- deleting missing record returns 404

---

## Environment Variables

Required:

- PORT (default 5007)
- MONGO_URI
- JWT_SECRET

Optional (for AI):

- GEMINI_API_KEY
- GEMINI_MODEL (default: gemini-2.5-flash)

If Gemini key/config is missing, service still works using rule-based fallback.

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

Validation failures include `errors` array with field-level details.

---

## Important Notes

- This is triage guidance, not a diagnosis.
- Do not provide medicine dosage or unsafe treatment advice.
- Frontend should call via API Gateway route base (`http://localhost:5000/api/symptoms`) for aligned routing.
