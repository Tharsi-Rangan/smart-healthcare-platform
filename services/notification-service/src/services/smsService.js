import twilio from 'twilio';

let client = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

/**
 * Send SMS notification
 */
export const sendSMS = async (to, body) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Twilio not configured, using mock SMS');
      return { success: true, sid: 'MOCK_' + Date.now(), mock: true };
    }

    const smsClient = getClient();
    if (!smsClient) {
      console.warn('[SMS] Twilio credentials not available, using mock SMS');
      return { success: true, sid: 'MOCK_' + Date.now(), mock: true };
    }

    console.log(`[SMS] Sending to ${to}`);

    const message = await smsClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`[SMS] Sent successfully. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('[SMS] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * SMS templates
 */
export const appointmentBookedSMS = (doctorName, appointmentDate, appointmentTime) =>
  `MediConnect: Your appointment with Dr. ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}. Visit your app to complete payment.`;

export const consultationCompletedSMS = (doctorName) =>
  `MediConnect: Your consultation with Dr. ${doctorName} is complete. Check your app for your report and prescription.`;

export const appointmentCancelledSMS = (doctorName, appointmentDate) =>
  `MediConnect: Your appointment with Dr. ${doctorName} on ${appointmentDate} has been cancelled. Book a new appointment in your app.`;

export const paymentReceivedSMS = (doctorName, amount) =>
  `MediConnect: Payment of LKR ${amount} received for consultation with Dr. ${doctorName}. Thank you!`;

export const appointmentReminderSMS = (doctorName, appointmentTime) =>
  `MediConnect Reminder: Your consultation with Dr. ${doctorName} starts at ${appointmentTime}. Be ready!`;

export const doctorRegistrationSMS = (doctorName, specialization) =>
  `MediConnect ADMIN: New doctor registration from Dr. ${doctorName} (${specialization}). Review and approve in your admin dashboard.`;
