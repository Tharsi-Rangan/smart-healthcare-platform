import nodemailer from 'nodemailer';

// Create transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification
 */
export const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    console.log(`[Email] Sending to ${to}: ${subject}`);

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Email templates
 */
export const appointmentBookedTemplate = (patientName, doctorName, appointmentDate, appointmentTime) => ({
  subject: `Appointment Confirmation with Dr. ${doctorName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <h1 style="color: #667eea; margin-bottom: 20px;">Appointment Confirmed! ✓</h1>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi <strong>${patientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Your appointment has been successfully booked with <strong>Dr. ${doctorName}</strong>.
        </p>
        
        <div style="background-color: #f0f4f8; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${appointmentDate}</p>
          <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${appointmentTime}</p>
          <p style="margin: 10px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          📝 <strong>Next Steps:</strong>
          <br/>• Arrive 10 minutes early
          <br/>• Bring your medical ID (if any)
          <br/>• Have your payment method ready
          <br/>• Log in to your MediConnect account to complete payment
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          If you need to reschedule or cancel, please do so at least 24 hours in advance.
          <br/>
          <strong>MediConnect Team</strong>
        </p>
      </div>
    </div>
  `,
  text: `Appointment Confirmation\n\nHi ${patientName},\n\nYour appointment with Dr. ${doctorName} has been confirmed.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\n\nPlease complete your payment in the MediConnect app.`,
});

export const consultationCompletedTemplate = (patientName, doctorName, prescriptionLink) => ({
  subject: `Consultation Complete - Your Report from Dr. ${doctorName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <h1 style="color: #4caf50; margin-bottom: 20px;">Consultation Completed! ✓</h1>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi <strong>${patientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Your consultation with <strong>Dr. ${doctorName}</strong> has been completed. Your medical report and prescriptions are now available.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${prescriptionLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Your Report &amp; Prescription
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          📋 <strong>What's Included:</strong>
          <br/>• Doctor's notes and diagnosis
          <br/>• Prescribed medications
          <br/>• Follow-up instructions
          <br/>• Lab recommendations (if any)
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          If you have questions about your prescription, please reach out to Dr. ${doctorName} or contact our support team.
          <br/>
          <strong>MediConnect Team</strong>
        </p>
      </div>
    </div>
  `,
  text: `Your consultation with Dr. ${doctorName} is complete.\n\nYour report and prescription are ready in your MediConnect account.`,
});

export const appointmentCancelledTemplate = (patientName, doctorName, appointmentDate) => ({
  subject: `Appointment Cancelled - Dr. ${doctorName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <h1 style="color: #f5576c; margin-bottom: 20px;">Appointment Cancelled</h1>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi <strong>${patientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Your appointment scheduled for <strong>${appointmentDate}</strong> with Dr. ${doctorName} has been cancelled.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          You can book a new appointment anytime through your MediConnect account or contact us for assistance.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          <strong>MediConnect Team</strong>
        </p>
      </div>
    </div>
  `,
  text: `Your appointment on ${appointmentDate} with Dr. ${doctorName} has been cancelled.`,
});

export const paymentReceivedTemplate = (patientName, doctorName, amount, transactionId) => ({
  subject: `Payment Receipt - MediConnect Consultation`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <h1 style="color: #4caf50; margin-bottom: 20px;">Payment Received ✓</h1>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi <strong>${patientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Thank you for your payment. Your consultation fee has been successfully received.
        </p>
        
        <div style="background-color: #f0f4f8; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 10px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> LKR ${amount}</p>
          <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Your receipt has been saved to your MediConnect account. You can download it anytime from your payment history.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          <strong>MediConnect Team</strong>
        </p>
      </div>
    </div>
  `,
  text: `Payment of LKR ${amount} received for consultation with Dr. ${doctorName}.\n\nTransaction ID: ${transactionId}`,
});

export const doctorRegistrationTemplate = (doctorName, specialization, licenseNumber) => ({
  subject: `New Doctor Registration - ${doctorName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <h1 style="color: #3b82f6; margin-bottom: 20px;">🩺 New Doctor Registration</h1>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          A new doctor has registered on MediConnect and is awaiting your verification.
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 10px 0;"><strong>Doctor Name:</strong> ${doctorName}</p>
          <p style="margin: 10px 0;"><strong>Specialization:</strong> ${specialization}</p>
          <p style="margin: 10px 0;"><strong>License Number:</strong> ${licenseNumber}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Please review the doctor's credentials and approve or reject their registration.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/admin/verify-doctors" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Review Doctor
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          <strong>MediConnect Team</strong>
        </p>
      </div>
    </div>
  `,
  text: `New doctor registration from ${doctorName} (${specialization}) - License: ${licenseNumber}. Please review in admin dashboard.`,
});
