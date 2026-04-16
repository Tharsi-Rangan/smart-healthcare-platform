import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import routes from './routes/paymentNotificationRoutes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) =>
  res.json({ success: true, message: 'Payment-Notification service running', port: process.env.PORT || 5006 })
);

app.use('/api', routes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error.' });
});

export default app;
