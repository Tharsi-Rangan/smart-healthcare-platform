# Architecture Documentation - Smart Healthcare Platform

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Frontend (React + Vite)                                  │
│          Patient Portal | Doctor Portal | Admin Dashboard | Consultation | Payment           │
└──────────────┬───────────────────────────────┬───────────────────────────────┬───────────────┘
               │                               │                               │
           HTTP/REST                       HTTP/REST                       HTTP/REST
               │                               │                               │
┌──────────────▼──────────┐      ┌─────────────▼──────────┐      ┌─────────────▼──────────┐
│      Auth Service       │      │     Patient Service    │      │   Appointment Service  │
│      (Port 5001)        │      │      (Port 5002)       │      │       (Port 5003)      │
└──────────────┬──────────┘      └─────────────┬──────────┘      └─────────────┬──────────┘
               │                               │                               │
┌──────────────▼──────────┐      ┌─────────────▼──────────┐      ┌─────────────▼──────────┐
│   Consultation Service  │      │  Payment-Notification  │      │     Doctor Service     │
│      (Port 5004)        │      │      (Port 5005)       │      │       (Port 5006)      │
└──────────────┬──────────┘      └─────────────┬──────────┘      └─────────────┬──────────┘
               │                               │                               │
               └───────────────────────┬───────┴───────────────────────────────┘
                                       │
                             ┌─────────▼────────┐      ┌──────────────────────────┐
                             │   MongoDB 6.0    │      │  Symptom-Checker Service │
                             │   (Port 27017)   │      │        (Port 5007)       │
                             └──────────────────┘      └──────────────────────────┘
```

## Service Architecture

### 1. Auth Service (Port 5001)
- **Responsibilities**: JWT issuance, user login/registration, OTP verification, and role-based access control (RBAC).

### 2. Patient Service (Port 5002)
- **Responsibilities**: Patient profile management, medical history tracking, medical report uploads (Multer), and dashboard summaries.

### 3. Appointment Service (Port 5003)
- **Responsibilities**: Appointment booking, scheduling, status management, and integration with doctor availability.

### 4. Consultation Service (Port 5004)
- **Responsibilities**: 
  - Manage consultation lifecycle (pending → active → completed)
  - Generate video session links using Jitsi (meet.jit.si)
  - Store consultation notes and prescriptions
  - Generate medical passports for patients.

### 5. Payment-Notification Service (Port 5005)
- **Responsibilities**:
  - Handle payment initiation and status tracking (PayHere sandbox)
  - Process payment success/failure callbacks
  - Send email notifications (Nodemailer)
  - Manage real-time notification records for the dashboard.

### 6. Doctor Service (Port 5006)
- **Responsibilities**: Doctor profile management, availability scheduling, patient report reviews, and diagnosis history.

### 7. Symptom-Checker Service (Port 5007)
- **Responsibilities**: AI-driven symptom analysis using Google Gemini API.

## Integration Points

### Authentication Flow
1. **User logs in** via Auth Service.
2. **JWT token** is stored in localStorage.
3. **Token sent** with every API request in the Authorization header.
4. **Each service** verifies the token using a shared or service-specific `JWT_SECRET`.

### Service-to-Service Communication (Internal)
The services use internal REST calls to synchronize state:
- **Consultation (5004)** ←→ **Appointment (5003)**: Verifies valid booking before starting video.
- **Payment (5005)** → **Consultation (5004)**: Triggers consultation creation upon successful payment success.

## Technology Stack

- **Frontend**: React 18, Vite, Framer Motion (premium animations), Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Communication**: Email (Nodemailer), Video (Jitsi Meet).
- **Infrastructure**: Docker, Kubernetes (Minikube/Cloud), Docker Compose.

## Deployment Architecture

### Kubernetes Production
- **Deployments**: Each service runs as a Deployment with 2+ replicas.
- **Services**: `ClusterIP` for internal communication; `NodePort` or `Ingress` for frontend access.
- **PersistentVolume**: Ensuring MongoDB data survives pod restarts.

---

**Last Updated**: April 15, 2026
**Version**: 2.0.0 (Unified Port Standardization)
