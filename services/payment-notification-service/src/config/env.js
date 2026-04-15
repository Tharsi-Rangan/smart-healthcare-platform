const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "PORT",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

const missingVars = requiredEnvVars.filter((env) => !process.env[env]);

if (missingVars.length > 0) {
  console.error(`Missing environment variables: ${missingVars.join(", ")}`);
}

export default {
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/payment_notification_db",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_payment_service_secret",
    expiresIn: process.env.JWT_EXPIRY || "7d",
  },
  port: process.env.PORT || 5005,
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
  paymentGateway: {
    payhereUrl:
      process.env.PAYHERE_URL || "https://sandbox.payhere.lk/pay",
    payhereUrlApiUrl:
      process.env.PAYHERE_API_URL ||
      "https://sandbox.payhere.lk/merchant/pay/initiator/",
    payhereCheckUrl:
      process.env.PAYHERE_CHECK_URL ||
      "https://sandbox.payhere.lk/merchant/pay/check",
  },
  consultationServiceUrl:
    process.env.CONSULTATION_SERVICE_URL || "http://localhost:5004",
  appointmentServiceUrl:
    process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5003",
};
