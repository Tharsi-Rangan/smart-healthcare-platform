# API Contract

## Auth Service

### POST /api/auth/register/patient
Register a patient account

### POST /api/auth/register/doctor
Register a doctor account

### POST /api/auth/login
Login user and return JWT token

### POST /api/auth/verify-email
Verify user email using token

### POST /api/auth/resend-verification-email
Resend verification email

### POST /api/auth/forgot-password
Send password reset email

### POST /api/auth/reset-password
Reset password using secure token

### GET /api/auth/me
Get currently logged-in user
Access: Protected