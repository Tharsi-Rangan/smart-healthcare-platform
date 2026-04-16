import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import crypto from 'crypto';

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

const toBase64Url = (value) => Buffer.from(value).toString('base64url');

const createInternalServiceToken = () => {
  const jwtSecret = process.env.DOCTOR_SERVICE_JWT_SECRET || process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('Missing DOCTOR_SERVICE_JWT_SECRET or JWT_SECRET for gateway public doctors endpoint');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: 'api-gateway-service',
    email: 'gateway@internal.local',
    role: 'admin',
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
};

const normalizeDoctorsPayload = (payload) => {
  const doctors = payload?.data?.doctors;
  return Array.isArray(doctors) ? doctors : [];
};

app.get('/api/public/doctors', async (req, res) => {
  try {
    const token = createInternalServiceToken();
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5006';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const specialization =
      typeof req.query.specialization === 'string'
        ? req.query.specialization.trim().toLowerCase()
        : '';

    const query = new URLSearchParams();
    if (search) {
      query.set('search', search);
    }

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors${query.toString() ? `?${query.toString()}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: payload?.message || 'Failed to fetch doctors from doctor service',
      });
    }

    const approvedDoctors = normalizeDoctorsPayload(payload).filter((doctor) => {
      const isApproved = doctor?.approvalStatus === 'approved';
      const isActive = doctor?.isActive !== false;
      const specializationMatches =
        !specialization || String(doctor?.specialization || '').toLowerCase() === specialization;

      return isApproved && isActive && specializationMatches;
    });

    return res.status(200).json({
      success: true,
      message: 'Public doctors fetched successfully',
      data: {
        doctors: approvedDoctors,
      },
    });
  } catch (error) {
    console.error('Gateway public doctors error:', error.message);

    if (error.message.includes('DOCTOR_SERVICE_JWT_SECRET')) {
      return res.status(500).json({
        success: false,
        message: 'Gateway misconfiguration: missing doctor-service JWT secret',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public doctors',
    });
  }
});

app.get('/api/public/doctors/:id', async (req, res) => {
  try {
    const token = createInternalServiceToken();
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5006';

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: payload?.message || 'Failed to fetch doctor details',
      });
    }

    const doctor = payload?.data?.doctor;

    if (!doctor || doctor.approvalStatus !== 'approved' || doctor.isActive === false) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor fetched successfully',
      data: {
        doctor,
      },
    });
  } catch (error) {
    console.error('Gateway public doctor details error:', error.message);

    if (error.message.includes('DOCTOR_SERVICE_JWT_SECRET')) {
      return res.status(500).json({
        success: false,
        message: 'Gateway misconfiguration: missing doctor-service JWT secret',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
    });
  }
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
