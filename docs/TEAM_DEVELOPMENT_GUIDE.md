# Smart Healthcare Platform — Team Development Guide

## Purpose

This document explains how the team should continue development from the current project foundation without causing merge conflicts, folder confusion, or duplicated work.

The foundation already completed includes:

- auth backend
- OTP email verification
- resend OTP
- forgot password
- reset password
- JWT authentication
- role-based authorization
- frontend structure
- protected routes
- dashboard layouts
- frontend auth pages
- Tailwind-based UI foundation

From this point onward, each member should work only in their assigned module area.

---

## 1. Current Shared Foundation

### Backend already completed

- `auth-service`
- patient registration
- doctor registration
- email OTP verification
- resend OTP
- login
- protected `/me`
- forgot password
- reset password
- JWT token generation
- auth middleware
- role middleware
- centralized error handling
- Postman-tested auth endpoints

### Frontend already completed

- React + Vite setup
- Tailwind CSS setup
- frontend folder structure
- public layout
- patient, doctor, admin layouts
- login page
- register page
- verify OTP page
- forgot password page
- reset password page
- frontend-backend auth integration
- auth state management
- protected routes
- dashboard placeholders

These should **not** be rebuilt by other members.

---

## 2. Branching Rules

### Main branch roles

**`main`**

Final stable branch only.

**`dev`**

Integration branch where stable work from feature branches is merged.

**Feature branches**

Each member must work in their own feature branch only.

### Required Git flow for all members

Before starting work:

```bash
git checkout dev
git pull origin dev
git checkout your-feature-branch
git merge dev
```

After finishing stable work:

```bash
git add .
git commit -m "your clear commit message"
git push
```

Only merge into dev when the work is tested and stable.

---

## 3. Frontend Structure

All frontend work must follow this structure:

```
frontend/src/
├── app/
│   └── router/
├── layouts/
│   ├── PublicLayout.jsx
│   ├── PatientLayout.jsx
│   ├── DoctorLayout.jsx
│   └── AdminLayout.jsx
├── pages/
│   ├── public/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│   └── shared/
├── features/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   ├── admin/
│   ├── appointment/
│   ├── consultation/
│   ├── payment/
│   └── notification/
├── components/
│   ├── common/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   └── admin/
├── services/
├── hooks/
├── utils/
├── constants/
├── assets/
└── styles/
```

### Frontend folder meaning

- `pages/` = route pages
- `features/` = feature/module logic
- `components/` = reusable UI parts
- `services/` = API call files
- `layouts/` = dashboard/public wrappers

**Rule:** Do not create random new top-level folders.

---

## 4. Backend Structure

Each backend service must follow this pattern:

```
services/<service-name>/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── Dockerfile
```

### Backend folder meaning

- `config/` = env and DB config
- `controllers/` = request/response handling
- `middleware/` = auth, role checks, error handling
- `models/` = database schemas
- `routes/` = API route mapping
- `services/` = business logic
- `utils/` = helpers
- `validations/` = request validation

**Rule:** Do not mix everything into one file.

5. MongoDB Plan

Use one shared MongoDB Atlas cluster and separate databases for separate services.

Database names
auth_db
patient_db
doctor_db
appointment_db
consultation_db
payment_notification_db
Rule

Each service uses only its own database.

Examples
auth-service → auth_db
patient-service → patient_db
doctor-service → doctor_db
appointment-service → appointment_db
consultation-service → consultation_db
payment-notification-service → payment_notification_db

No service should directly read or write another service’s database.

Services must communicate through APIs, not through database sharing.

## 6. Auth Rules for Everyone

All members must use the existing auth system.

### Auth already available

- registration
- email OTP verification
- resend OTP
- login
- JWT token
- protected route flow
- role-based authorization
- forgot password
- reset password

### Required request header format

```
Authorization: Bearer <token>
```

### Roles

- patient
- doctor
- admin

### Do not do these

- do not build a separate login system
- do not create another JWT system
- do not create another user identity table
- do not bypass the auth service

### Member 1 — Patient Module

**Owner:** Tharsiga Ranganathaan

**Frontend folders**

- pages/patient/
- features/patient/
- components/patient/

**Backend service**

- services/patient-service

**Database**

- patient_db

**Frontend pages to develop**

- pages/patient/ProfilePage.jsx
- pages/patient/MedicalHistoryPage.jsx
- pages/patient/ReportsPage.jsx
- pages/patient/PrescriptionsPage.jsx
- pages/patient/MyAppointmentsPage.jsx
- pages/patient/NotificationsPage.jsx

**Backend requirements**

- patient profile
- medical history
- reports upload/view
- prescriptions view
- patient summary data

**Suggested APIs**

- GET /api/patients/profile
- PUT /api/patients/profile
- GET /api/patients/medical-history
- POST /api/patients/reports
- GET /api/patients/reports

### Member 2 — Doctor Module + Admin Doctor Verification

**Frontend folders**

- pages/doctor/
- pages/admin/
- features/doctor/
- features/admin/
- components/doctor/
- components/admin/

**Backend service**

- services/doctor-service

**Database**

- doctor_db

**Frontend pages to develop**

**Doctor pages**

- pages/doctor/ProfilePage.jsx
- pages/doctor/AvailabilityPage.jsx
- pages/doctor/AppointmentsPage.jsx
- pages/doctor/ReportsReviewPage.jsx
- pages/doctor/PrescriptionPage.jsx

**Admin pages**

- pages/admin/VerifyDoctorsPage.jsx
- pages/admin/ManageUsersPage.jsx
- pages/admin/ManageDoctorsPage.jsx

**Backend requirements**

- doctor profile
- specialization
- hospital
- experience
- availability
- approval status
- admin approval/rejection

**Suggested model fields**

- authUserId
- specialization
- licenseNumber
- hospital
- experience
- approvalStatus

**Approval status values**

- pending
- approved
- rejected

**Suggested APIs**

- GET /api/doctors/profile
- PUT /api/doctors/profile
- PUT /api/doctors/availability
- GET /api/doctors
- GET /api/doctors/:id
- GET /api/doctors/pending
- PATCH /api/doctors/:id/approve
- PATCH /api/doctors/:id/reject

**Important note**

### Member 3 — Appointment Module

**Frontend folders**

- features/appointment/
- booking-related shared pages/components

**Backend service**

- services/appointment-service

**Database**

- appointment_db

**Frontend pages to develop**

- pages/shared/DoctorListPage.jsx
- pages/shared/DoctorDetailsPage.jsx
- pages/shared/BookAppointmentPage.jsx

**Backend requirements**

- appointment create
- cancel appointment
- reschedule appointment
- patient appointment list
- doctor appointment list
- appointment status

**Suggested APIs**

- POST /api/appointments
- GET /api/appointments/patient
- GET /api/appointments/doctor
- PATCH /api/appointments/:id/cancel
- PATCH /api/appointments/:id/reschedule

### Member 4 — Consultation + Payment + Notification Module

**Frontend folders**

- features/consultation/
- features/payment/
- features/notification/

**Backend services**

- services/consultation-service
- services/payment-notification-service

**Databases**

- consultation_db
- payment_notification_db

**Frontend pages to develop**

- pages/shared/ConsultationPage.jsx
- pages/shared/PaymentPage.jsx

**Backend requirements**

**Consultation**

- consultation session data
- consultation status
- doctor notes
- prescription creation

**Payment / Notification**

- payment initialization
- payment confirmation
- reminders/notifications

**Suggested APIs**

**Consultation**

- POST /api/consultations/start
- GET /api/consultations/:id
- POST /api/prescriptions
- GET /api/prescriptions/patient/:id

**Payment / Notification**

- POST /api/payments/initiate
- POST /api/payments/confirm
- POST /api/notifications/send

## 8. Frontend Development Rules

Each member must edit only the pages and features that belong to their module.

### Shared frontend files — edit carefully

These files are shared and should not be changed casually:

- frontend/src/app/router/AppRouter.jsx
- frontend/src/layouts/\*
- auth files
- shared constants/theme
- shared services if common changes are needed

### Rule

If any shared file must be changed, inform the team first.

## 9. Backend Development Rules

Each member must only work inside their assigned service folder.

### Shared backend files — edit carefully

These should not be changed casually:

- services/auth-service/
- shared docs
- shared middleware if introduced later

## 10. Actual Development Flow for Each Member

Each member should follow this order:

1. Pull latest dev
2. Merge dev into personal feature branch
3. Create backend service skeleton
4. Initialize Node.js and install packages
5. Set up MongoDB connection to assigned DB
6. Create models
7. Create validation rules
8. Create controllers, services, routes
9. Test APIs using Postman
10. Build frontend pages for the module
11. Connect frontend to backend
12. Test full flow

## 11. API Contract Rule

All members must update docs/API_CONTRACT.md only for their service/module area.

### Suggested sections

- Auth Service
- Patient Service
- Doctor Service
- Appointment Service
- Consultation Service
- Payment / Notification Service

## 12. Commit Message Style

Use clear commit messages.

### Good examples

- feat: add patient profile model and routes
- feat: build doctor approval page
- feat: implement appointment booking API
- fix: validate OTP input length
- docs: update appointment service API contract
- refactor: extract patient report form component

### Avoid

- update
- done
- final
- new code

## 13. Conflict Prevention Rules

**Rule 1** — No direct push to main

**Rule 2** — Only tested work goes into dev

**Rule 3** — Each person edits only their own module folders

**Rule 4** — Tell the team before changing shared files

**Rule 5** — Do not rename folders after module work starts

**Rule 6** — Do not create duplicate auth or duplicate user identity logic

## 14. Docker and Kubernetes Plan

### Important

Do not start Docker/Kubernetes now.

First complete:

- backend APIs
- frontend integration
- basic module flows

### When to start Docker

After the main app flows are stable.

### Docker plan later

Create one Dockerfile for each:

- auth-service
- patient-service
- doctor-service
- appointment-service
- consultation-service
- payment-notification-service
- frontend

### Kubernetes plan later

Inside k8s/, prepare:

- one Deployment YAML per service
- one Service YAML per service
- frontend deployment/service later

### Beginner understanding

- Docker = package each service so it runs the same everywhere
- Kubernetes = manage and run those containers

### Recommendation

One person should lead final Docker/Kubernetes setup with support from others.

## 15. Immediate Action Items for Team

### Everyone must do now

```bash
git checkout dev
git pull origin dev
git checkout your-feature-branch
git merge dev
```

Then start only your assigned module.
