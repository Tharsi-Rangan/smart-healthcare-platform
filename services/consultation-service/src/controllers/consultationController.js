import Consultation from '../models/Consultation.js';
import axios from 'axios';

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5004';

const getAppointmentById = async (appointmentId, token) => {
  const res = await axios.get(`${APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res?.data?.data?.appointment;
};

// POST /api/consultations/start — doctor starts session
export const startConsultation = async (req, res) => {
  try {
    const { appointmentId, patientId, patientName, doctorName, specialization } = req.body;

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required.' });
    }

    let appointment;
    try {
      appointment = await getAppointmentById(appointmentId, token);
    } catch {
      return res.status(400).json({ success: false, message: 'Appointment not found or inaccessible.' });
    }

    if (!appointment || appointment.doctorAuthId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can start this consultation.' });
    }
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Consultation can only start for confirmed appointments.' });
    }

    const roomName = `mediconnect-${appointmentId}-${Date.now()}`;

    const existing = await Consultation.findOne({ appointmentId });
    if (existing) {
      // Return existing room so they can rejoin
      existing.status = 'active';
      existing.startedAt = existing.startedAt || new Date();
      await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Rejoining existing consultation.',
        data: { consultation: existing },
      });
    }

    const consultation = await Consultation.create({
      appointmentId,
      patientId: patientId || appointment.patientId,
      patientName: patientName || appointment.patientName,
      doctorId:      req.user.userId,
      doctorName: doctorName || appointment.doctorName,
      specialization: specialization || appointment.specialization,
      roomName,
      status:    'active',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Consultation started.',
      data: { consultation },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/consultations/appointment/:appointmentId
export const getConsultationByAppointment = async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ appointmentId: req.params.appointmentId });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found.' });

    const isParticipant = consultation.patientId === req.user.userId || consultation.doctorId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { consultation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/consultations/:id/end — doctor ends session
export const endConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found.' });

    if (consultation.doctorId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can end the session.' });
    }

    const endedAt = new Date();
    const durationMin = consultation.startedAt
      ? Math.round((endedAt - consultation.startedAt) / 60000)
      : 0;

    consultation.status    = 'completed';
    consultation.endedAt   = endedAt;
    consultation.durationMin = durationMin;
    if (req.body.notes) consultation.doctorNotes = req.body.notes;
    await consultation.save();

    res.status(200).json({ success: true, message: 'Consultation ended.', data: { consultation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/consultations/doctor — doctor's consultation history
export const getDoctorConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctorId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { consultations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/consultations/patient — patient's consultation history
export const getPatientConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { consultations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
