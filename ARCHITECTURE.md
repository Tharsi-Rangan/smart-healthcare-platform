# Architecture Documentation - Smart Healthcare Platform

## System Overview (Microservices with API Gateway)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     Frontend (React + Vite)                                  │
│          Patient Portal | Doctor Portal | Admin Dashboard | Consultation | Payment           │
└───────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │
                                            HTTP/REST
                                       (Target Port 5000)
                                                │
                                    ┌───────────▼───────────┐
                                    │      API GATEWAY      │
                                    │      (Port 5000)      │
                                    └───────────┬───────────┘
                                                │
        ┌──────────────┬──────────────┬─────────┴────┬──────────────┬──────────────┐
        │              │              │              │              │              │
┌───────▼───────┐┌─────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
│ Auth Service  ││ Patient Svc ││ Appt Service ││ Consult Svc ││ Payment Svc ││ Doctor Svc  │
│ (Port 5001)   ││ (Port 5002) ││ (Port 5003)  ││ (Port 5004)  ││ (Port 5005)  ││ (Port 5006)  │
└───────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
                                       │
                             ┌─────────▼────────┐      ┌──────────────────────────┐
                             │   MongoDB 6.0    │      │  Symptom-Checker Service │
                             │   (Port 27017)   │      │        (Port 5007)       │
                             └──────────────────┘      └──────────────────────────┘
```

## Service Architecture

### 1. API Gateway (Port 5000)
- **Role**: The single entry point for all frontend traffic.
- **Responsibilities**: 
    - Reverse proxying requests based on URL paths.
    - Global CORS handling for the React frontend.
    - Unified request logging (Observability).
    - Simplified frontend environment configuration.

### 2. Auth Service (Port 5001)
- **Responsibilities**: JWT issuance, user login/registration, OTP verification, and role-based access control (RBAC).

### 3. Patient Service (Port 5002)
- **Responsibilities**: Patient profile management, medical history tracking, medical report uploads (Multer), and dashboard summaries.

### 4. Appointment Service (Port 5003)
- **Responsibilities**: Appointment booking, scheduling, status management, and integration with doctor availability.

### 5. Consultation Service (Port 5004)
- **Responsibilities**: 
  - Manage consultation lifecycle (pending → active → completed)
  - Generate video session links using Jitsi (meet.jit.si)
  - Store consultation notes and prescriptions
  - Generate medical passports for patients.

### 6. Payment-Notification Service (Port 5005)
- **Responsibilities**:
  - Handle payment initiation and status tracking (PayHere sandbox)
  - Process payment success/failure callbacks
  - Send email notifications (Nodemailer)
  - Manage real-time notification records for the dashboard.

### 7. Doctor Service (Port 5006)
- **Responsibilities**: Doctor profile management, availability scheduling, patient report reviews, and diagnosis history.

### 8. Symptom-Checker Service (Port 5007)
- **Responsibilities**: AI-driven symptom analysis using Google Gemini API.

## Integration Points

### Request Flow
1. **Frontend** makes a call to `http://localhost:5000/api/patients/profile`.
2. **API Gateway** receives the request, logs it, and identifies the `/api/patients` prefix.
3. **API Gateway** proxies the request to `http://localhost:5002/api/patients/profile`.
4. **Patient Service** processes the request and returns data to the Gateway.
5. **API Gateway** sends the response back to the Frontend.

## Technology Stack

- **API Gateway**: Node.js, Express, `http-proxy-middleware`, `morgan`.
- **Frontend**: React 18, Vite, Framer Motion, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).

## Deployment Architecture

### Kubernetes Production
- **Ingress Controller**: Acts as the production API Gateway.
- **Internal Services**: Mapped via K8s Service names (e.g., `http://auth-service:5001`).

---

**Last Updated**: April 15, 2026
**Version**: 3.0.0 (API Gateway Integrated)
