import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import ConsultationSession from '../models/consultation.model.js';
import axios from 'axios';

// Generate Twilio video access token
export const generateVideoToken = asyncHandler(async (req, res) => {
  const { appointmentId, userName, userRole } = req.body;

  if (!appointmentId || !userName) {
    throw new AppError('Appointment ID and username are required', 400);
  }

  // Verify payment status via payment service
  try {
    const paymentRes = await axios.get(
      `http://localhost:5006/api/payments/${appointmentId}/status`,
      {
        headers: {
          Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`,
        },
      }
    );

    if (!paymentRes.data?.data?.consultationAvailable) {
      throw new AppError('Payment not approved. Consultation not available yet.', 403);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      throw new AppError('Payment not found', 404);
    }
    console.warn('Payment verification warning:', error.message);
    // Continue - payment service might be down
  }

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
  const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET) {
    throw new AppError('Twilio credentials not configured', 500);
  }

  // Generate unique room name from appointment ID
  const roomName = `consultation-${appointmentId}`;
  const identity = `${userRole || 'user'}-${req.user.id}`;

  // Create JWT token for Twilio
  const token = jwt.sign(
    {
      iss: TWILIO_API_KEY,
      sub: TWILIO_ACCOUNT_SID,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      grants: {
        video: {
          room: roomName,
        },
      },
    },
    TWILIO_API_SECRET,
    { algorithm: 'HS256' }
  );

  // Create session record
  let session = await ConsultationSession.findOne({ appointmentId });
  
  if (!session) {
    session = await ConsultationSession.create({
      appointmentId,
      roomName,
      status: 'scheduled',
      participants: [],
      startedAt: new Date(),
    });
  }

  // Add participant
  if (!session.participants.includes(identity)) {
    session.participants.push(identity);
    await session.save();
  }

  res.status(200).json({
    success: true,
    message: 'Video token generated successfully',
    data: {
      token,
      roomName,
      appointmentId,
      userName,
    },
  });
});

// Get consultation session details
export const getConsultationSession = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const session = await ConsultationSession.findOne({ appointmentId });

  if (!session) {
    throw new AppError('Consultation session not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Session details fetched successfully',
    data: session,
  });
});

// End consultation session
export const endConsultationSession = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const session = await ConsultationSession.findOne({ appointmentId });

  if (!session) {
    throw new AppError('Consultation session not found', 404);
  }

  session.status = 'completed';
  session.endedAt = new Date();
  session.duration = Math.round((session.endedAt - session.startedAt) / 1000); // seconds
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Session ended successfully',
    data: session,
  });
});

// Get doctor's consultation history
export const getConsultationHistory = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { limit = 10, skip = 0 } = req.query;

  const sessions = await ConsultationSession.find({ doctorId })
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ createdAt: -1 });

  const total = await ConsultationSession.countDocuments({ doctorId });

  res.status(200).json({
    success: true,
    message: 'Consultation history fetched',
    data: {
      sessions,
      pagination: { total, limit: Number(limit), skip: Number(skip) },
    },
  });
});
