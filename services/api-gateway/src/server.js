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

app.get('/api/public/doctors', async (req, res) => {
  try {
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
    if (specialization) {
      query.set('specialization', specialization);
    }

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors/public/list${query.toString() ? `?${query.toString()}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
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

    return res.status(200).json({
      success: true,
      data: payload?.data || { doctors: [] },
    });
  } catch (error) {
    console.error('Error fetching public doctors:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching doctors',
    });
  }
});

app.get('/api/public/doctors/:id', async (req, res) => {
  try {
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5006';

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors/public/${req.params.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
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
    const availability = payload?.data?.availability || [];

    if (!doctor) {
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
        availability,  // Include availability slots
      },
    });
  } catch (error) {
    console.error('Error fetching public doctor details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching doctor details',
    });
  }
});

// Alternative routing: /api/doctors/public/* (for backward compatibility)
app.get('/api/doctors/public/list', async (req, res) => {
  try {
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
    if (specialization) {
      query.set('specialization', specialization);
    }

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors/public/list${query.toString() ? `?${query.toString()}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
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

    return res.status(200).json({
      success: true,
      data: payload?.data || { doctors: [] },
    });
  } catch (error) {
    console.error('Error fetching public doctors:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching doctors',
    });
  }
});

app.get('/api/doctors/public/:id', async (req, res) => {
  try {
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5006';

    const response = await fetch(
      `${doctorServiceUrl}/api/doctors/public/${req.params.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
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
    const availability = payload?.data?.availability || [];

    if (!doctor) {
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
        availability,  // Include availability slots
      },
    });
  } catch (error) {
    console.error('Error fetching public doctor details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching doctor details',
    });
  }
});

// Proxy Configuration
const serviceMap = {
  'auth': process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  'patients': process.env.PATIENT_SERVICE_URL || 'http://localhost:5002',
  'appointments': process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003',
  'symptoms': process.env.SYMPTOM_CHECKER_URL || 'http://localhost:5007',
  'consultations': process.env.CONSULTATION_SERVICE_URL || 'http://localhost:5004',
  'payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',
  'notifications': process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',  // Notifications are part of payment service
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
