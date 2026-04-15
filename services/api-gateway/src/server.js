import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logging & CORS
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

// Proxy Configuration
const serviceMap = {
  'auth': process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  'patients': process.env.PATIENT_SERVICE_URL || 'http://localhost:5002',
  'appointments': process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003',
  'consultations': process.env.CONSULTATION_SERVICE_URL || 'http://localhost:5004',
  'payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',
  'doctors': process.env.DOCTOR_SERVICE_URL || 'http://localhost:5006',
  'symptom-checker': process.env.SYMPTOM_CHECKER_URL || 'http://localhost:5007',
};

// Single Proxy Middleware for all /api routes
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5001', // Default fallback
  router: (req) => {
    // Extract the service name from the path (e.g., /api/patients/summary -> patients)
    const segments = req.path.split('/');
    const serviceName = segments[1] || segments[0]; // Handle /api/auth or /auth
    return serviceMap[serviceName];
  },
  changeOrigin: true,
  pathRewrite: (path) => `/api${path}`, // Prepend /api back because app.use('/api') strips it
  onProxyRes: (proxyRes, req, res) => {
    // Optional: Log successful proxying
  },
  onError: (err, req, res) => {
    console.error(`Gateway Proxy Error:`, err.message);
    res.status(502).json({ error: 'Gateway Error', message: 'Service unreachable' });
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway v2 running on port ${PORT}`);
  console.log(`🔗 Routes Managed: ${Object.keys(serviceMap).join(', ')}`);
});
