import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  appointmentId:  { type: String, required: true, index: true },
  patientId:      { type: String, required: true },
  patientName:    { type: String, required: true },
  patientEmail:   { type: String, default: '' },
  patientPhone:   { type: String, default: '' },
  doctorId:       { type: String, required: true },
  doctorName:     { type: String, required: true },
  specialization: { type: String, default: '' },
  consultationFee: { type: Number, default: 500, description: 'Doctor consultation fee in LKR' },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: 'LKR' },
  paymentMethod:  { type: String, enum: ['payhere', 'stripe', 'frimi', 'cash', 'dummy'], default: 'payhere' },
  status:         { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  adminStatus:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  transactionId:  { type: String, default: '' },
  paymentData:    { type: Object, default: {} },
  paidAt:         { type: Date },
  adminApprovedAt: { type: Date },
  approvedBy:     { type: String, default: '' }, // Admin ID
  rejectionReason: { type: String, default: '' },
  adminNotes:     { type: String, default: '' },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

