# Auth Service Integration Guide

## Purpose

This document explains how other team members should use the Auth Service in the Smart Healthcare Platform.

The Auth Service is responsible for:

- user registration
- email verification with OTP
- login
- JWT token generation
- protected route authentication
- role-based authorization
- forgot password
- reset password

The Auth Service is **not** responsible for doctor professional approval.
Doctor approval should be handled in the doctor/admin module.

---

## Base URL

### Local Development

```text
http://localhost:5001
```

## User Roles

The system currently supports these roles:

- patient
- doctor
- admin

These roles are stored in the JWT token and used for authorization.

## Account Rules

### Patient

- registers through auth service
- verifies email using OTP
- can login after email verification

### Doctor

- registers through auth service
- verifies email using OTP
- can login after email verification
- doctor profile approval by admin is a separate process
- doctor approval must be handled in doctor-service

### Admin

- should be created manually or seeded
- admin registration should not be publicly exposed

## Important Separation of Responsibility

### Auth Service handles

- identity
- login
- password management
- email OTP verification
- JWT token creation
- role inside token

### Doctor/Admin module handles

- doctor professional details
- medical license info
- hospital affiliation
- experience details
- uploaded documents
- admin approval or rejection of doctor accounts

## JWT Token Payload

The access token includes:

```json
{
  "userId": "USER_ID",
  "email": "user@example.com",
  "role": "patient"
}
```

Other services should read the user identity from the verified token.

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
  "errors": []
}
```

All services should try to follow a similar response format for consistency.

## Auth Endpoints

### 1. Register Patient

**POST** `/api/auth/register/patient`

**Request Body**

```json
{
  "name": "Tharsiga Ranganathan",
  "email": "rangantharsi@gmail.com",
  "password": "Password123"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Patient registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Tharsiga Ranganathan",
      "email": "rangantharsi@gmail.com",
      "role": "patient",
      "isEmailVerified": false,
      "accountStatus": "pending_verification"
    }
  }
}
```

### 2. Register Doctor

**POST** `/api/auth/register/doctor`

**Request Body**

```json
{
  "name": "Doctor Name",
  "email": "doctor@example.com",
  "password": "Password123"
}
```

**Notes**

- this only creates the doctor account in auth
- email verification is required
- doctor approval is handled separately in doctor-service

### 3. Verify Email OTP

**POST** `/api/auth/verify-email-otp`

**Request Body**

```json
{
  "email": "rangantharsi@gmail.com",
  "otp": "123456"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 4. Resend Email OTP

**POST** `/api/auth/resend-email-otp`

**Request Body**

```json
{
  "email": "rangantharsi@gmail.com"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Verification OTP sent successfully"
}
```

### 5. Login

**POST** `/api/auth/login`

**Request Body**

```json
{
  "email": "rangantharsi@gmail.com",
  "password": "Password123"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "USER_ID",
      "name": "Tharsiga Ranganathan",
      "email": "rangantharsi@gmail.com",
      "role": "patient",
      "isEmailVerified": true,
      "accountStatus": "active"
    }
  }
}
```

**Notes**

- save the token on frontend after login
- use the token for protected routes

### 6. Get Current User

**GET** `/api/auth/me`

**Headers**

`Authorization: Bearer JWT_TOKEN_HERE`

**Success Response**

```json
{
  "success": true,
  "message": "Current user fetched successfully",
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "Tharsiga Ranganathan",
      "email": "rangantharsi@gmail.com",
      "role": "patient",
      "isEmailVerified": true,
      "accountStatus": "active",
      "createdAt": "DATE",
      "updatedAt": "DATE"
    }
  }
}
```

**Purpose**

Other modules can use this route to confirm the currently logged-in user.

### 7. Forgot Password

**POST** `/api/auth/forgot-password`

**Request Body**

```json
{
  "email": "rangantharsi@gmail.com"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### 8. Reset Password

**POST** `/api/auth/reset-password`

**Request Body**

```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "newPassword": "NewPassword123"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Protected Route Usage for Other Team Members

If another service needs protected access:

- frontend logs in through auth service
- frontend receives JWT token
- frontend sends token in Authorization header
- backend service verifies token using auth logic or shared middleware

### Required Header Format

`Authorization: Bearer JWT_TOKEN_HERE`

## How Other Services Should Use Auth

### Patient Module

Should use auth token to identify:

- current patient
- patient profile owner
- patient appointment owner
- patient medical history owner

### Doctor Module

Should use auth token to identify:

- current doctor account
- role must be doctor

**Important:**

Doctor-service must also check its own approvalStatus before allowing full doctor actions.

### Admin Module

Should use auth token to identify:

- current admin
- role must be admin

Admin-only routes must be protected with role checks.

## Role Authorization Rule

**Basic Rule:**

- authentication checks who the user is
- authorization checks what the user is allowed to do

**Example:**

- patient token cannot access admin route
- doctor token cannot access admin route
- admin token can access admin routes

## Suggested Backend Protection Pattern

### Example Flow for Another Service

- verify JWT
- get req.user
- check req.user.role
- continue only if allowed

### Example Role Check

- patient routes → allow patient
- doctor routes → allow doctor
- admin routes → allow admin

## Doctor Approval Design Recommendation

Auth service should not decide whether a doctor is professionally approved.

Recommended design in doctor-service:

### Doctor Profile Fields

- authUserId
- specialization
- licenseNumber
- hospital
- experience
- approvalStatus

### Approval Status Values

- pending
- approved
- rejected

### Flow

- doctor registers in auth service
- doctor verifies email
- doctor profile is created in doctor-service
  admin reviews doctor details
  admin approves or rejects doctor
  only approved doctors get full doctor access
  Frontend Integration Notes
  After Login

Store:

token
user role
basic user info
Route Handling Idea
patient → patient dashboard
doctor → doctor dashboard
admin → admin dashboard
Before Page Access

Frontend can check:

is token present?
what is the user role?
Postman Test Order

Suggested order:

Health Check
Register Patient
Register Doctor
Login Before Verification
Resend Email OTP
Verify Email OTP
Login After Verification
Get Current User
Forgot Password
Reset Password
Login With New Password
Current Auth Service Status

This auth service currently supports:

registration
OTP email verification
resend OTP
login
protected /me
forgot password
reset password
JWT auth
role middleware
validation
centralized error handling

This auth module is ready for integration with the rest of the system.

Important Notes for Team
do not duplicate login logic in other services
do not build separate user identity tables in every module
use the auth token as the common identity source
keep doctor approval separate from auth email verification
keep response format consistent across services
Contact Point for Integration

If another member needs:

token format
auth route details
protected route usage
role behavior

they should follow this document and the Auth Service Postman collection.
