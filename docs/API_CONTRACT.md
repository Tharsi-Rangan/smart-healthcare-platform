# API Contract

## Auth Service

### POST /api/auth/register/patient

Register a patient account and send email verification OTP

### POST /api/auth/register/doctor

Register a doctor account and send email verification OTP

### POST /api/auth/login

Login user and return JWT token

### POST /api/auth/verify-email-otp

Verify user email using 6-digit OTP

### POST /api/auth/resend-email-otp

Resend email verification OTP

### POST /api/auth/forgot-password

Send password reset email

### POST /api/auth/reset-password

Reset password using secure reset token

### GET /api/auth/me

Get currently logged-in user  
Access: Protected