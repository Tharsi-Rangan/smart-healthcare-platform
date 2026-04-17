import Notification from '../models/Notification.js';
import { sendEmail, appointmentBookedTemplate, consultationCompletedTemplate, appointmentCancelledTemplate, paymentReceivedTemplate, doctorRegistrationTemplate } from '../services/emailService.js';
import { sendSMS, appointmentBookedSMS, consultationCompletedSMS, appointmentCancelledSMS, paymentReceivedSMS, doctorRegistrationSMS } from '../services/smsService.js';

/**
 * Send appointment booked notification
 */
export const notifyAppointmentBooked = async (req, res) => {
  try {
    const { 
      patientId, 
      patientName, 
      patientEmail, 
      patientPhone,
      doctorId,
      doctorName, 
      appointmentId,
      appointmentDate, 
      appointmentTime 
    } = req.body;

    if (!patientEmail || !doctorName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Notification] Sending appointment booked notification to', patientEmail);

    const emailTemplate = appointmentBookedTemplate(patientName, doctorName, appointmentDate, appointmentTime);
    const smsBody = appointmentBookedSMS(doctorName, appointmentDate, appointmentTime);

    // Create notification record
    const notification = await Notification.create({
      recipient: {
        userId: patientId,
        email: patientEmail,
        phone: patientPhone,
        name: patientName,
        role: 'patient',
      },
      type: 'appointment_booked',
      subject: emailTemplate.subject,
      message: smsBody,
      htmlContent: emailTemplate.html,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointmentId,
      },
      status: 'sending',
    });

    // Send email
    const emailResult = await sendEmail(patientEmail, emailTemplate.subject, emailTemplate.html);
    notification.channels.email.sent = emailResult.success;
    notification.channels.email.sentAt = new Date();
    if (!emailResult.success) notification.channels.email.error = emailResult.error;

    // Send SMS if phone exists
    if (patientPhone) {
      const smsResult = await sendSMS(patientPhone, smsBody);
      notification.channels.sms.sent = smsResult.success;
      notification.channels.sms.sentAt = new Date();
      if (!smsResult.success) notification.channels.sms.error = smsResult.error;
    }

    // Update notification status
    notification.status = emailResult.success ? 'sent' : 'failed';
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Appointment notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send consultation completed notification
 */
export const notifyConsultationCompleted = async (req, res) => {
  try {
    const { 
      patientId,
      patientName, 
      patientEmail, 
      patientPhone,
      doctorName, 
      consultationId,
      prescriptionLink 
    } = req.body;

    if (!patientEmail || !doctorName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Notification] Sending consultation completed notification to', patientEmail);

    const emailTemplate = consultationCompletedTemplate(patientName, doctorName, prescriptionLink);
    const smsBody = consultationCompletedSMS(doctorName);

    // Create notification record
    const notification = await Notification.create({
      recipient: {
        userId: patientId,
        email: patientEmail,
        phone: patientPhone,
        name: patientName,
        role: 'patient',
      },
      type: 'consultation_completed',
      subject: emailTemplate.subject,
      message: smsBody,
      htmlContent: emailTemplate.html,
      relatedEntity: {
        entityType: 'consultation',
        entityId: consultationId,
      },
      status: 'sending',
    });

    // Send email
    const emailResult = await sendEmail(patientEmail, emailTemplate.subject, emailTemplate.html);
    notification.channels.email.sent = emailResult.success;
    notification.channels.email.sentAt = new Date();
    if (!emailResult.success) notification.channels.email.error = emailResult.error;

    // Send SMS if phone exists
    if (patientPhone) {
      const smsResult = await sendSMS(patientPhone, smsBody);
      notification.channels.sms.sent = smsResult.success;
      notification.channels.sms.sentAt = new Date();
      if (!smsResult.success) notification.channels.sms.error = smsResult.error;
    }

    notification.status = emailResult.success ? 'sent' : 'failed';
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Consultation notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send appointment cancelled notification
 */
export const notifyAppointmentCancelled = async (req, res) => {
  try {
    const { 
      patientId,
      patientName, 
      patientEmail, 
      patientPhone,
      doctorName, 
      appointmentId,
      appointmentDate
    } = req.body;

    if (!patientEmail || !doctorName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Notification] Sending appointment cancelled notification to', patientEmail);

    const emailTemplate = appointmentCancelledTemplate(patientName, doctorName, appointmentDate);
    const smsBody = appointmentCancelledSMS(doctorName, appointmentDate);

    const notification = await Notification.create({
      recipient: {
        userId: patientId,
        email: patientEmail,
        phone: patientPhone,
        name: patientName,
        role: 'patient',
      },
      type: 'appointment_cancelled',
      subject: emailTemplate.subject,
      message: smsBody,
      htmlContent: emailTemplate.html,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointmentId,
      },
      status: 'sending',
    });

    const emailResult = await sendEmail(patientEmail, emailTemplate.subject, emailTemplate.html);
    notification.channels.email.sent = emailResult.success;
    notification.channels.email.sentAt = new Date();
    if (!emailResult.success) notification.channels.email.error = emailResult.error;

    if (patientPhone) {
      const smsResult = await sendSMS(patientPhone, smsBody);
      notification.channels.sms.sent = smsResult.success;
      notification.channels.sms.sentAt = new Date();
      if (!smsResult.success) notification.channels.sms.error = smsResult.error;
    }

    notification.status = emailResult.success ? 'sent' : 'failed';
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Cancellation notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send payment received notification
 */
export const notifyPaymentReceived = async (req, res) => {
  try {
    const { 
      patientId,
      patientName, 
      patientEmail, 
      patientPhone,
      doctorName, 
      amount,
      transactionId,
      paymentId
    } = req.body;

    if (!patientEmail || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Notification] Sending payment received notification to', patientEmail);

    const emailTemplate = paymentReceivedTemplate(patientName, doctorName, amount, transactionId);
    const smsBody = paymentReceivedSMS(doctorName, amount);

    const notification = await Notification.create({
      recipient: {
        userId: patientId,
        email: patientEmail,
        phone: patientPhone,
        name: patientName,
        role: 'patient',
      },
      type: 'payment_received',
      subject: emailTemplate.subject,
      message: smsBody,
      htmlContent: emailTemplate.html,
      relatedEntity: {
        entityType: 'payment',
        entityId: paymentId,
      },
      status: 'sending',
    });

    const emailResult = await sendEmail(patientEmail, emailTemplate.subject, emailTemplate.html);
    notification.channels.email.sent = emailResult.success;
    notification.channels.email.sentAt = new Date();
    if (!emailResult.success) notification.channels.email.error = emailResult.error;

    if (patientPhone) {
      const smsResult = await sendSMS(patientPhone, smsBody);
      notification.channels.sms.sent = smsResult.success;
      notification.channels.sms.sentAt = new Date();
      if (!smsResult.success) notification.channels.sms.error = smsResult.error;
    }

    notification.status = emailResult.success ? 'sent' : 'failed';
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Payment notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send doctor registration notification to admin
 */
export const notifyDoctorRegistration = async (req, res) => {
  try {
    const { 
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      specialization,
      licenseNumber,
      adminId,
      adminEmail,
      adminName,
    } = req.body;

    if (!doctorName || !specialization || !adminEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('[Notification] Sending doctor registration notification to admin', adminEmail);

    const emailTemplate = doctorRegistrationTemplate(doctorName, specialization, licenseNumber);
    const smsBody = doctorRegistrationSMS(doctorName, specialization);

    // Create notification record
    const notification = await Notification.create({
      recipient: {
        userId: adminId,
        email: adminEmail,
        phone: process.env.TWILIO_PHONE_NUMBER,
        name: adminName || 'Admin',
        role: 'admin',
      },
      type: 'doctor_registration',
      subject: emailTemplate.subject,
      message: smsBody,
      htmlContent: emailTemplate.html,
      relatedEntity: {
        entityType: 'doctor',
        entityId: doctorId,
      },
      status: 'sending',
    });

    // Send email
    const emailResult = await sendEmail(adminEmail, emailTemplate.subject, emailTemplate.html);
    notification.channels.email.sent = emailResult.success;
    notification.channels.email.sentAt = new Date();
    if (!emailResult.success) notification.channels.email.error = emailResult.error;

    // Update notification status
    notification.status = emailResult.success ? 'sent' : 'failed';
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Doctor registration notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Notify patient that doctor started consultation
 */
export const notifyConsultationStarted = async (req, res) => {
  try {
    const { 
      patientId,
      patientName, 
      patientEmail, 
      patientPhone,
      doctorName,
      appointmentId,
      appointmentTime,
      message
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Missing patientId' });
    }

    console.log('[Notification] Doctor started consultation for patient', patientId);

    // Create notification record
    const notification = await Notification.create({
      recipient: {
        userId: patientId,
        email: patientEmail,
        phone: patientPhone,
        name: patientName,
        role: 'patient',
      },
      type: 'consultation_started',
      subject: `Dr. ${doctorName} has started your consultation`,
      message: message || `Dr. ${doctorName} has started the video consultation. Please join now.`,
      htmlContent: `<p>Dr. ${doctorName} has started your video consultation at ${appointmentTime}. Please join the session immediately.</p>`,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointmentId,
      },
      status: 'sent',
      isRead: false,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Consultation started notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Notify doctor that patient joined consultation
 */
export const notifyPatientJoinedSession = async (req, res) => {
  try {
    const { 
      doctorId,
      doctorName, 
      doctorEmail, 
      doctorPhone,
      patientName,
      appointmentId,
      appointmentTime,
      message
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Missing doctorId' });
    }

    console.log('[Notification] Patient joined consultation for doctor', doctorId);

    // Create notification record
    const notification = await Notification.create({
      recipient: {
        userId: doctorId,
        email: doctorEmail,
        phone: doctorPhone,
        name: doctorName,
        role: 'doctor',
      },
      type: 'patient_joined_session',
      subject: `${patientName} has joined the consultation`,
      message: message || `${patientName} has joined the video consultation. Please join now.`,
      htmlContent: `<p>${patientName} has joined your video consultation at ${appointmentTime}. Please join the session immediately.</p>`,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointmentId,
      },
      status: 'sent',
      isRead: false,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Patient joined notification sent',
      data: { notification },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get notifications for user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const notifications = await Notification.find({ 'recipient.userId': userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments({ 'recipient.userId': userId });

    res.status(200).json({
      success: true,
      data: { notifications, total },
    });
  } catch (error) {
    console.error('[Notification] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Health check
 */
export const health = async (req, res) => {
  res.json({ success: true, message: 'Notification service online' });
};
