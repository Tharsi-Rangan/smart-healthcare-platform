import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:     { type: String, required: true, index: true },
  role:       { type: String, enum: ['patient', 'doctor', 'admin'] },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  type:       { type: String, enum: ['appointment', 'payment', 'consultation', 'system'], default: 'system' },
  isRead:     { type: Boolean, default: false },
  relatedId:  { type: String, default: '' },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
