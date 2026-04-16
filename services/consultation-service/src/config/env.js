const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "PORT",
  "APPOINTMENT_SERVICE_URL",
  "PATIENT_SERVICE_URL",
  "DOCTOR_SERVICE_URL",
];

const missingVars = requiredEnvVars.filter((env) => !process.env[env]);

if (missingVars.length > 0) {
  console.error(`Missing environment variables: ${missingVars.join(", ")}`);
}

export default {
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/consultation_db",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_consultation_service_secret",
    expiresIn: process.env.JWT_EXPIRY || "7d",
  },
  port: process.env.PORT || 5004,
  appointmentServiceUrl:
    process.env.APPOINTMENT_SERVICE_URL || "http://localhost:3002",
  patientServiceUrl: process.env.PATIENT_SERVICE_URL || "http://localhost:5005",
  doctorServiceUrl: process.env.DOCTOR_SERVICE_URL || "http://localhost:3005",
  jitsiDomain: process.env.JITSI_DOMAIN || "meet.jit.si",
};
