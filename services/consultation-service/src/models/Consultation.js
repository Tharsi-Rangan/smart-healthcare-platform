import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId:     { type: String, required: true, index: true },
  patientName:   { type: String, required: true },
  doctorId:      { type: String, required: true, index: true },
  doctorName:    { type: String, required: true },
  specialization:{ type: String },
  roomName:      { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'scheduled',
  },
  startedAt:   { type: Date },
  endedAt:     { type: Date },
  durationMin: { type: Number, default: 0 },
  doctorNotes: { type: String, default: '' },
  
  // Twilio Video Session fields
  twilioRoomName: { type: String },
  twilioRoomSid: { type: String },
  recordingUrl: { type: String, default: null },
  recordingSid: { type: String, default: null },
  maxDuration: { type: Number, default: 30 }, // in minutes
  recordings: [{
    sid: String,
    url: String,
    duration: Number,
    dateCreated: Date,
  }],
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
