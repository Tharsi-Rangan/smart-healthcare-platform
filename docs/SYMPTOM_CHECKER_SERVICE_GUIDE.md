# Symptom Checker Service Integration Guide

## Purpose

This document is the current integration reference for Symptom Checker Service.

The service handles:

- symptom analysis
- urgency classification (`Low` / `Medium` / `High`)
- specialty recommendation
- AI-first with automatic rule-based fallback
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

Gateway mapping currently proxies `symptoms` and `symptom-checker` to the same service URL.

---

## Authentication and Role

All `/api/symptoms/*` routes require JWT and patient role.

`/health` does not require authentication.

Authorization header:

Authorization: Bearer TOKEN

Required JWT fields:

```json
{
  "userId": "USER_ID",
  "role": "patient"
}
```

---

## Current Routes

1. POST `/api/symptoms/analyze`
2. GET `/api/symptoms/history`
3. DELETE `/api/symptoms/history`
4. DELETE `/api/symptoms/:id`
5. GET `/health`

---

## Validation Rules

### Analyze (POST `/analyze`)

Required:

- `symptoms`: string, length 3..1000

Optional:

- `duration`: string, max 100
- `severity`: `low` | `medium` | `high`
- `ageGroup`: string, max 50
- `followUpAnswers`: object or array

### Delete one by id

- `id` must be a valid MongoDB id

---

## AI + Fallback Behavior

1. Service tries Gemini first (`GEMINI_API_KEY` + model).
2. If Gemini fails, returns empty output, or unparsable JSON, service falls back to rule-based logic.
3. Record is still saved and response is still returned successfully.
4. Response always includes `source` and `disclaimer`.

Current source values in model enum:

- `gemini`
- `rule-based`
- `endlessmedical` (schema enum support)

### Gemini prompt constraints (implemented)

- Exactly one specialty from allowed list
- Urgency must be one of `Low`, `Medium`, `High`
- Exactly 3 home care tips
- No medicine dosage advice
- Triage guidance only, not diagnosis

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

If Gemini returns unsupported specialty text, service maps by keyword and defaults to `General Physician`.

---

## Stored Record Shape

```json
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
```

Note: `followUpAnswers` is request-only context for AI prompt construction and is not stored in this model.

---

## Analyze Request Example

```json
{
  "symptoms": "Chest pain and shortness of breath for 2 days",
  "duration": "2 days",
  "severity": "high",
  "ageGroup": "adult",
  "followUpAnswers": {
    "painRadiatesToArm": "yes",
    "sweating": "yes"
  }
}
```

## Analyze Success Response (HTTP 201)

```json
{
  "success": true,
  "message": "Symptoms analyzed successfully",
  "data": {
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
}
```

---

## Route Status Codes and Messages

- POST `/analyze`
  - `201`: Symptoms analyzed successfully
  - `400`: Validation failed
  - `401`: Authorization token is required / Invalid or expired token / Invalid token payload
  - `403`: Forbidden (role mismatch)

- GET `/history`
  - `200`: Symptom history fetched successfully
  - `401` / `403` as above

- DELETE `/history`
  - `200`: All symptom history deleted successfully

- DELETE `/:id`
  - `200`: Symptom record deleted successfully
  - `400`: Invalid symptom record id
  - `403`: Unauthorized (record belongs to another user)
  - `404`: Symptom record not found

- GET `/health`
  - `200`: Symptom checker service running

---

## Ownership Rules

- patient can access only their own records
- deleting other user's record returns `403`
- deleting missing record returns `404`

---

## Environment Variables

Required:

- `PORT` (default `5007`)
- `MONGO_URI`
- `JWT_SECRET`

Optional (AI path):

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default: `gemini-2.5-flash`)

If Gemini config is missing or fails at runtime, service still works with rule-based fallback.

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Validation failures include `errors` array with field-level details.

---

## Important Notes

- This is triage guidance, not a diagnosis.
- No dosage or unsafe treatment advice should be shown.
- Frontend should call via API Gateway route base: `http://localhost:5000/api/symptoms`.
