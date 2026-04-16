/**
 * Build notification data for doctor registration
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
 * @param {Object} axios - Axios instance
 * @param {String} endpoint - Endpoint to send notification to
 * @param {Object} data - Notification data
 * @param {String} token - Temporary token for authorization
 */
export const sendNotificationViaService = (
  axios,
  endpoint,
  data,
  token
) => {
  // Fire-and-forget - don't await or block
  if (!data || !axios) {
    console.warn('Notification helper: Missing axios or data');
    return;
  }

  try {
    // Send without awaiting - this should never block registration
    axios.post(`http://localhost:5008${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    }).catch((error) => {
      // Silently catch - notifications failing shouldn't affect registration
      console.debug('Notification delivery failed (non-critical):', error.message);
    });
  } catch (error) {
    // Silently fail - this should never throw
    console.debug('Notification service error (non-critical):', error.message);
  }
};
