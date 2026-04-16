import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) =>
  res.json({ success: true, message: 'Notification service running', port: process.env.PORT || 5007 })
);

app.use('/api', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.statusCode || 500).json({ 
    success: false, 
    message: err.message || 'Server error.' 
  });
});

export default app;
