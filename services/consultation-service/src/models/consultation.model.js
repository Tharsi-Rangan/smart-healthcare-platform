import mongoose from 'mongoose';

const consultationSessionSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true, index: true },
  doctorId: { type: String },
  patientId: { type: String },
  roomName: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'no-show'], default: 'scheduled' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  participants: [String], // Array of participant identities
  recordingUrl: { type: String, default: '' }, // If recording enabled
  notes: { type: String, default: '' },
}, { timestamps: true });

const ConsultationSession = mongoose.model('ConsultationSession', consultationSessionSchema);
export default ConsultationSession;
