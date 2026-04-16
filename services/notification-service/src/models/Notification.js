import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      email: { type: String, required: true },
      phone: { type: String },
      name: String,
      role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    },
    
    type: {
      type: String,
      enum: ['appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'consultation_started', 'consultation_completed', 'payment_received', 'prescription_issued', 'doctor_approval', 'general'],
      required: true,
    },
    
    subject: String,
    message: String,
    htmlContent: String,
    
    // Context data
    relatedEntity: {
      entityType: { type: String, enum: ['appointment', 'consultation', 'payment', 'prescription', 'doctor'] },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    
    // Notification channels
    channels: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      inApp: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        read: { type: Boolean, default: false },
        readAt: Date,
      },
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'sending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    
    retryCount: { type: Number, default: 0 },
    lastRetryAt: Date,
    
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ status: 1, 'relatedEntity.entityId': 1 });

export default mongoose.model('Notification', notificationSchema);
