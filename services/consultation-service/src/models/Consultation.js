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
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
