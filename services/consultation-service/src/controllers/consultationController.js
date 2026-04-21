import Consultation from '../models/Consultation.js';
import axios from 'axios';
import { generateVideoToken, createVideoRoom, endVideoRoom, getRecordings } from '../config/twilioConfig.js';

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003';

const getAppointmentById = async (appointmentId, token) => {
  const res = await axios.get(`${APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res?.data?.data?.appointment || res?.data?.data;
};

const getAppointmentDateTime = (appointment) => {
  const dateText = String(appointment?.appointmentDate || '').slice(0, 10);
  const [year, month, day] = dateText.split('-').map(Number);
  const [hours, minutes] = String(appointment?.appointmentTime || '').split(':').map(Number);

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const isWithinVideoJoinWindow = (appointment) => {
  const scheduledAt = getAppointmentDateTime(appointment);

  if (!scheduledAt) {
    return false;
  }

  const now = Date.now();
  const startsAt = scheduledAt.getTime() - 30 * 60000;
  const endsAt = scheduledAt.getTime() + 30 * 60000;

  return now >= startsAt && now <= endsAt;
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

    const roomName = `mediconnect-${appointmentId}`;

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
      patientId: String(
        patientId ||
          appointment.patientAuthUserId ||
          appointment.patientAuthId ||
          appointment.patientId
      ),
      patientName: patientName || appointment.patientName || appointment.patientDetails?.fullName || 'Patient',
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

// POST /api/consultations/video/token — Generate Twilio video access token
export const getVideoToken = async (req, res) => {
  try {
    const { appointmentId, roomName, userName } = req.body;

    if (!appointmentId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId and userName are required.',
      });
    }

    const authHeader = req.headers.authorization || '';
    const authToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    let appointment;
    try {
      appointment = await getAppointmentById(appointmentId, authToken);
    } catch {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const doctorAuthUserId = String(appointment.doctorAuthUserId || appointment.doctorAuthId || appointment.doctorId);
    const patientAuthUserId = String(appointment.patientAuthUserId || appointment.patientAuthId || appointment.patientId);
    const currentUserId = String(req.user.userId);
    const isParticipant = doctorAuthUserId === currentUserId || patientAuthUserId === currentUserId;

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this consultation.' });
    }

    if (appointment.consultationType !== 'online') {
      return res.status(400).json({ success: false, message: 'Only online appointments can use the video room.' });
    }

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Consultation can only start for confirmed appointments.',
      });
    }

    if (!isWithinVideoJoinWindow(appointment)) {
      return res.status(403).json({
        success: false,
        message: 'Video room opens 30 minutes before the consultation and closes 30 minutes after the scheduled time.',
      });
    }

    let consultation = await Consultation.findOne({ appointmentId });
    if (!consultation) {
      const resolvedRoomName = `mediconnect-${appointmentId}`;
      consultation = await Consultation.create({
        appointmentId,
        patientId: patientAuthUserId,
        patientName: appointment.patientName || appointment.patientDetails?.fullName || 'Patient',
        doctorId: doctorAuthUserId,
        doctorName: appointment.doctorName || 'Doctor',
        specialization: appointment.specialization || appointment.specialty,
        roomName: resolvedRoomName,
        status: 'active',
        startedAt: new Date(),
      });
    }

    const isConsultationParticipant =
      String(consultation.patientId) === currentUserId ||
      String(consultation.doctorId) === currentUserId;
    if (!isConsultationParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied to this consultation.' });
    }

    // Generate Twilio token
    const resolvedRoomName = consultation.roomName || roomName || `mediconnect-${appointmentId}`;
    const token = generateVideoToken(resolvedRoomName, userName, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Video token generated.',
      data: { token, roomName: resolvedRoomName },
    });
  } catch (error) {
    console.error('Error generating video token:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/consultations/video/room — Create Twilio video room
export const createVideoSessionRoom = async (req, res) => {
  try {
    const { appointmentId, roomName, maxDuration = 30 } = req.body;

    if (!appointmentId || !roomName) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId and roomName are required.',
      });
    }

    // Verify consultation exists
    const consultation = await Consultation.findOne({ appointmentId });
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    // Only doctor can create room
    if (consultation.doctorId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the doctor can create the video room.' });
    }

    // Create Twilio room
    const room = await createVideoRoom(roomName, 2);

    // Update consultation with room info
    consultation.twilioRoomName = roomName;
    consultation.twilioRoomSid = room.sid;
    consultation.maxDuration = maxDuration;
    await consultation.save();

    res.status(201).json({
      success: true,
      message: 'Video room created.',
      data: { room, consultation },
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/consultations/video/end — End Twilio video room and get recordings
export const endVideoSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required.' });
    }

    const consultation = await Consultation.findOne({ appointmentId });
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    // Only doctor can end room
    if (consultation.doctorId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the doctor can end the video room.' });
    }

    if (!consultation.twilioRoomName) {
      return res.status(400).json({ success: false, message: 'No active video room found.' });
    }

    // End Twilio room
    const endedRoom = await endVideoRoom(consultation.twilioRoomName);

    // Fetch recordings if available
    let recordings = [];
    try {
      recordings = await getRecordings(consultation.twilioRoomName);
      if (recordings && recordings.length > 0) {
        consultation.recordings = recordings.map(r => ({
          sid: r.sid,
          url: r.links?.media,
          duration: r.duration,
          dateCreated: r.dateCreated,
        }));
        consultation.recordingUrl = recordings[0]?.links?.media || null;
        consultation.recordingSid = recordings[0]?.sid || null;
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }

    consultation.status = 'completed';
    consultation.endedAt = new Date();
    const durationMin = consultation.startedAt
      ? Math.round((consultation.endedAt - consultation.startedAt) / 60000)
      : 0;
    consultation.durationMin = durationMin;
    await consultation.save();

    res.status(200).json({
      success: true,
      message: 'Video session ended.',
      data: { consultation, recordings },
    });
  } catch (error) {
    console.error('Error ending video session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/consultations/:id/recordings — Get recordings for a consultation
export const getConsultationRecordings = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    const isParticipant = consultation.patientId === req.user.userId || consultation.doctorId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({
      success: true,
      data: { recordings: consultation.recordings || [] },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
