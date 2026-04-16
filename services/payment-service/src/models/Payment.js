import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  appointmentId:  { type: String, required: true, index: true },
  patientId:      { type: String, required: true },
  patientName:    { type: String, required: true },
  patientEmail:   { type: String, default: '' },
  patientPhone:   { type: String, default: '' },
  doctorId:       { type: String, required: true },
  doctorName:     { type: String, required: true },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: 'LKR' },
  paymentMethod:  { type: String, enum: ['payhere', 'stripe', 'frimi', 'cash', 'dummy'], default: 'payhere' },
  status:         { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId:  { type: String, default: '' },
  paymentData:    { type: Object, default: {} },
  paidAt:         { type: Date },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
