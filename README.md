# Smart Healthcare Platform

## Appointment Service

Purpose:
The appointment-service manages patient appointment booking and lifecycle operations in the healthcare microservices system.

Main endpoints:
- `GET /health`
- `POST /api/appointments`
- `GET /api/appointments/my`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id/cancel`
- `PUT /api/appointments/:id/reschedule`

How to run locally:
1. Go to `services/appointment-service`.
2. Create `.env` using values from `.env.example`.
3. Install dependencies: `npm install`.
4. Run in dev mode: `npm run dev`.
5. Run in production mode: `npm start`.

Notes:
- This service expects a Bearer JWT from auth-service and reads `userId` and `role` from the token payload.
- MongoDB must be running and reachable via `MONGO_URI`.
