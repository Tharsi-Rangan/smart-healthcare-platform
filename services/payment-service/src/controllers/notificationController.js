import Notification from '../models/Notification.js';
import { sendEmail, appointmentConfirmationEmail, appointmentBookedEmail } from '../utils/emailService.js';
import { sendSMS, sendWhatsApp } from '../utils/smsService.js';
import axios from 'axios';

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003';

const normalizeNotificationType = (type = 'system') => {
  if (!type) return 'system';
  if (type === 'doctor_registration' || type === 'doctor_approval') return 'verification';
  if (['appointment', 'payment', 'consultation', 'verification', 'system'].includes(type)) {
    return type;
  }
  if (type.includes('_')) {
    const firstSegment = type.split('_')[0];
    if (['appointment', 'payment', 'consultation'].includes(firstSegment)) {
      return firstSegment;
    }
  }
  return 'system';
};

const getCurrentUserId = (user = {}) => user.userId || user.id || user._id || '';

const getNotificationAccessFilter = (user = {}) => {
  const currentUserId = getCurrentUserId(user);
  const role = user.role;

  if (!currentUserId || !role) {
    return { userId: '__no_user__' };
  }

  return {
    $or: [
      { userId: String(currentUserId) },
      { userId: role, role },
    ],
  };
};

const fetchAppointmentById = async (appointmentId, authHeader) => {
  if (!appointmentId) return null;

  try {
    const response = await axios.get(`${APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}`, {
      timeout: 5000,
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });

    return response.data?.data?.appointment || response.data?.data || null;
  } catch (error) {
    console.warn('[Notifications] Could not resolve appointment for notification routing:', error.message);
    return null;
  }
};

// POST /api/notifications/send — internal use
export const sendNotification = async (req, res) => {
  try {
    const {
      userId,
      role,
      title,
      message,
      type,
      relatedId,
      recipientRole,
      data,
    } = req.body;

    const resolvedRole = role || recipientRole || 'patient';
    const resolvedUserId =
      userId ||
      data?.userId ||
      data?.doctorId ||
      (resolvedRole === 'admin' ? 'admin' : resolvedRole);

    const notification = await Notification.create({
      userId: String(resolvedUserId),
      role: resolvedRole,
      title: title || 'Notification',
      message: message || 'You have a new notification.',
      type: normalizeNotificationType(type),
      relatedId: relatedId || '',
    });

    res.status(201).json({ success: true, message: 'Notification sent.', data: { notification } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/appointment-booked — called after patient books
export const notifyAppointmentBooked = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      appointmentId,
      appointmentDate,
      timeSlot,
      reason,
    } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, doctorId.',
      });
    }

    const appointment = await fetchAppointmentById(appointmentId, req.headers.authorization);
    const resolvedDoctorId =
      appointment?.doctorAuthUserId ||
      appointment?.doctorAuthId ||
      appointment?.doctorId ||
      doctorId;

    const resolvedPatientId =
      appointment?.patientAuthUserId ||
      appointment?.patientAuthId ||
      appointment?.patientId ||
      patientId;

    const formattedDate = appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-LK') : 'N/A';

    await Notification.create([
      {
        userId: String(resolvedPatientId),
        role: 'patient',
        title: 'Appointment Request Submitted',
        message: `Your appointment with ${doctorName || 'your doctor'} on ${formattedDate} at ${timeSlot || 'N/A'} is pending doctor approval.`,
        type: 'appointment',
        relatedId: appointmentId || '',
      },
      {
        userId: String(resolvedDoctorId),
        role: 'doctor',
        title: 'Pending Appointment Approval',
        message: `${patientName || 'A patient'} booked an appointment for ${formattedDate} at ${timeSlot || 'N/A'}. Please review and approve.`,
        type: 'appointment',
        relatedId: appointmentId || '',
      },
    ]);

    // Send Email to doctor
    if (doctorEmail) {
      await sendEmail({
        to: doctorEmail,
        subject: 'MediConnect — New Appointment Booking',
        html: appointmentBookedEmail(patientName, appointmentDate, timeSlot, reason),
      });
    }

    // Send SMS and WhatsApp to doctor
    if (doctorPhone) {
      const smsBody = `MediConnect: You have a new appointment with ${patientName} on ${formattedDate} at ${timeSlot}.`;
      await sendSMS({ to: doctorPhone, body: smsBody }).catch(err => console.error(err));
      await sendWhatsApp({ to: doctorPhone, body: smsBody }).catch(err => console.error(err));
    }

    // Optional patient confirmation message.
    if (patientPhone) {
      const smsBody = `MediConnect: Your appointment request with ${doctorName || 'the doctor'} on ${formattedDate} at ${timeSlot} is pending doctor approval.`;
      await sendSMS({ to: patientPhone, body: smsBody }).catch(err => console.error(err));
    }

    res.status(200).json({ success: true, message: 'Notifications sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/appointment-confirmed — called after doctor confirms
export const notifyAppointmentConfirmed = async (req, res) => {
  try {
    const {
      patientId, patientName, patientEmail, patientPhone,
      doctorId, doctorName,
      appointmentId, appointmentDate, timeSlot,
    } = req.body;

    // Notify patient
    await Notification.create({
      userId: patientId, role: 'patient',
      title:   'Appointment Confirmed',
      message: `Your appointment with ${doctorName} on ${appointmentDate} at ${timeSlot} has been confirmed.`,
      type: 'appointment', relatedId: appointmentId,
    });

    // Notify doctor
    await Notification.create({
      userId: doctorId, role: 'doctor',
      title:   'New Appointment',
      message: `You have a new confirmed appointment with ${patientName} on ${appointmentDate} at ${timeSlot}.`,
      type: 'appointment', relatedId: appointmentId,
    });

    // Send email to patient
    if (patientEmail) {
      await sendEmail({
        to:      patientEmail,
        subject: 'MediConnect — Appointment Confirmed',
        html:    appointmentConfirmationEmail(patientName, doctorName, appointmentDate, timeSlot),
      });
    }

    // Send SMS and WhatsApp to patient
    if (patientPhone) {
      const smsBody = `MediConnect: Your appointment with ${doctorName} on ${appointmentDate} at ${timeSlot} has been confirmed.`;
      await sendSMS({ to: patientPhone, body: smsBody });
      await sendWhatsApp({ to: patientPhone, body: smsBody });
    }

    res.status(200).json({ success: true, message: 'Notifications sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/consultation-started — doctor notifies patient
export const notifyConsultationStarted = async (req, res) => {
  try {
    const { patientId, doctorName, appointmentId, appointmentTime, message } = req.body;

    if (!patientId || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: patientId, appointmentId.' });
    }

    const body =
      message ||
      `Dr. ${doctorName || 'Your doctor'} has started the video consultation. Please join now.`;

    const notification = await Notification.create({
      userId: patientId,
      role: 'patient',
      title: 'Consultation Started',
      message: body,
      type: 'consultation',
      relatedId: appointmentId,
    });

    res.status(200).json({ success: true, message: 'Consultation start notification sent.', data: { notification } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/patient-joined-session — patient notifies doctor
export const notifyPatientJoinedSession = async (req, res) => {
  try {
    const { doctorId, patientName, appointmentId, appointmentTime, message } = req.body;

    if (!doctorId || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: doctorId, appointmentId.' });
    }

    const body =
      message ||
      `${patientName || 'Patient'} has joined the video consultation. Please join now.`;

    const notification = await Notification.create({
      userId: doctorId,
      role: 'doctor',
      title: 'Patient Joined Session',
      message: body,
      type: 'consultation',
      relatedId: appointmentId,
    });

    res.status(200).json({ success: true, message: 'Patient joined notification sent.', data: { notification } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications — user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find(getNotificationAccessFilter(req.user))
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark single as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getNotificationAccessFilter(req.user),
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/read-all — mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        ...getNotificationAccessFilter(req.user),
        isRead: false,
      },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id — delete single notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      ...getNotificationAccessFilter(req.user),
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/delete-all — delete all notifications for current user
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany(getNotificationAccessFilter(req.user));
    res.status(200).json({
      success: true,
      message: 'All notifications deleted.',
      data: { deletedCount: result.deletedCount || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      ...getNotificationAccessFilter(req.user),
      isRead: false,
    });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/payment-confirmed — called after payment processed
export const notifyPaymentConfirmed = async (req, res) => {
  try {
    const {
      patientId, patientName, patientEmail, patientPhone,
      doctorId, doctorName,
      amount, appointmentId, appointmentDate,
    } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !amount || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: patientId, doctorId, amount, appointmentId.' });
    }

    // Format date for display
    const formattedDate = appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-LK') : 'N/A';

    // Notify patient
    await Notification.create({
      userId: patientId, role: 'patient',
      title:   '💳 Payment Successful',
      message: `Payment of LKR ${amount} for your appointment with ${doctorName} on ${formattedDate} has been confirmed.`,
      type: 'payment', relatedId: appointmentId,
    });

    // Notify doctor
    await Notification.create({
      userId: doctorId, role: 'doctor',
      title:   '💰 Payment Received',
      message: `Payment of LKR ${amount} for appointment with ${patientName} has been received.`,
      type: 'payment', relatedId: appointmentId,
    });

    // Send email to patient (non-blocking)
    if (patientEmail) {
      setImmediate(() => {
        sendEmail({
          to:      patientEmail,
          subject: 'MediConnect — Payment Confirmation',
          html:    `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
              <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#0f766e;margin:0;">MediConnect</h2>
                <p style="color:#64748b;font-size:14px;">Your health, our priority</p>
              </div>
              <h3 style="color:#1e293b;">💳 Payment Confirmed</h3>
              <p style="color:#475569;">Hi <strong>${patientName}</strong>,</p>
              <p style="color:#475569;">Your payment has been successfully processed.</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:4px 0;color:#166534;"><strong>Doctor:</strong> ${doctorName}</p>
                <p style="margin:4px 0;color:#166534;"><strong>Amount:</strong> LKR ${amount}</p>
                <p style="margin:4px 0;color:#166534;"><strong>Appointment Date:</strong> ${formattedDate}</p>
                <p style="margin:4px 0;color:#166534;"><strong>Date of Payment:</strong> ${new Date().toLocaleDateString('en-LK')}</p>
              </div>
              <p style="color:#64748b;font-size:13px;">Thank you for using MediConnect!</p>
            </div>
          `,
        }).catch(err => console.error('Email send failed:', err.message));
      });
    }

    // Send SMS and WhatsApp to patient
    if (patientPhone) {
      const smsBody = `MediConnect: Payment of LKR ${amount} for your appointment with ${doctorName} on ${formattedDate} has been confirmed.`;
      setImmediate(() => {
        sendSMS({ to: patientPhone, body: smsBody }).catch(err => console.error('SMS error:', err.message));
        sendWhatsApp({ to: patientPhone, body: smsBody }).catch(err => console.error('WhatsApp error:', err.message));
      });
    }

    res.status(200).json({ success: true, message: 'Payment notification sent.' });
  } catch (error) {
    console.error('Payment notification error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
