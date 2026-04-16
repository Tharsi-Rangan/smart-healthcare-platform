import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, required: true },
  frequency: { type: String, required: true },
  duration:  { type: String, default: '' },
  notes:     { type: String, default: '' },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  consultationId: { type: String, default: '' },
  appointmentId:  { type: String, required: true },
  patientId:      { type: String, required: true, index: true },
  patientName:    { type: String, required: true },
  doctorId:       { type: String, required: true, index: true },
  doctorName:     { type: String, required: true },
  specialization: { type: String, default: '' },
  diagnosis:      { type: String, required: true },
  medications:    [medicationSchema],
  notes:          { type: String, default: '' },
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
