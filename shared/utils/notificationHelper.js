import axios from 'axios';

const notificationClient = axios.create({
  baseURL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008/api',
  timeout: 5000,
});

/**
 * Send appointment booked notification
 */
export const notifyAppointmentBooked = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorId,
  doctorName,
  appointmentId,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped: notifications disabled via env');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/appointment-booked', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      doctorName,
      appointmentId,
      appointmentDate,
      appointmentTime,
    });
    
    console.log('[Notification] Appointment booked notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('[notifyAppointmentBooked] Error:', error.message);
    // Don't throw - notifications shouldn't block main flow
    return { success: false, error: error.message };
  }
};

/**
 * Send consultation completed notification
 */
export const notifyConsultationCompleted = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  consultationId,
  prescriptionLink,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped: notifications disabled via env');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/consultation-completed', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      consultationId,
      prescriptionLink,
    });

    console.log('[Notification] Consultation completed notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('[notifyConsultationCompleted] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment cancelled notification
 */
export const notifyAppointmentCancelled = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  appointmentId,
  appointmentDate,
  cancellationReason,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped: notifications disabled via env');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/appointment-cancelled', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      appointmentId,
      appointmentDate,
      cancellationReason,
    });

    console.log('[Notification] Appointment cancelled notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('[notifyAppointmentCancelled] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment received notification
 */
export const notifyPaymentReceived = async ({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  amount,
  transactionId,
  paymentId,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped: notifications disabled via env');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/payment-received', {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      amount,
      transactionId,
      paymentId,
    });

    console.log('[Notification] Payment received notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('[notifyPaymentReceived] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send doctor registration notification to admin
 */
export const notifyDoctorRegistration = async ({
  doctorId,
  doctorName,
  doctorEmail,
  doctorPhone,
  specialization,
  licenseNumber,
  adminEmail,
}) => {
  try {
    if (process.env.SEND_NOTIFICATIONS === 'false') {
      console.log('[Notification] Skipped: notifications disabled via env');
      return { success: true, skipped: true };
    }

    const response = await notificationClient.post('/notifications/doctor-registration', {
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone,
      specialization,
      licenseNumber,
      adminEmail,
    });

    console.log('[Notification] Doctor registration notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('[notifyDoctorRegistration] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Build notification data for doctor registration (legacy)
 * @param {Object} doctor - Doctor user object
 * @returns {Object} Notification data
 */
export const buildDoctorRegistrationNotification = (doctor) => {
  try {
    return {
      type: 'doctor_registration',
      title: 'New Doctor Registration',
      message: `New doctor registered: ${doctor.name} (${doctor.email})`,
      recipientRole: 'admin',
      data: {
        doctorId: doctor._id?.toString(),
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        registrationDate: new Date(),
        status: 'pending_verification',
      },
    };
  } catch (error) {
    console.error('Error building doctor registration notification:', error);
    return null;
  }
};

/**
 * Send notification via notification service (fire-and-forget)
 * @param {Object} axiosInstance - Axios instance
 * @param {String} endpoint - Endpoint to send notification to
 * @param {Object} data - Notification data
 * @param {String} token - Temporary token for authorization
 */
export const sendNotificationViaService = (
  axiosInstance,
  endpoint,
  data,
  token
) => {
  // Fire-and-forget - don't await or block
  if (!data || !axiosInstance) {
    console.warn('Notification helper: Missing axios or data');
    return;
  }

  try {
    // Send without awaiting - this should never block
    axiosInstance.post(`http://localhost:5008${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    }).catch((error) => {
      // Silently catch - notifications failing shouldn't affect main flow
      console.debug('Notification delivery failed (non-critical):', error.message);
    });
  } catch (error) {
    // Silently fail - this should never throw
    console.debug('Notification service error (non-critical):', error.message);
  }
};

export default {
  notifyAppointmentBooked,
  notifyConsultationCompleted,
  notifyAppointmentCancelled,
  notifyPaymentReceived,
  notifyDoctorRegistration,
  buildDoctorRegistrationNotification,
  sendNotificationViaService,
};
