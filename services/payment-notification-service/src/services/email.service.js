import nodemailer from "nodemailer";
import config from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: config.smtp.user,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
};

export const sendAppointmentBookedEmail = async (patientEmail, doctorEmail, appointmentDetails) => {
  const patientContent = `
    <h2>Appointment Confirmed</h2>
    <p>Your appointment has been confirmed!</p>
    <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
    <p><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</p>
    <p><strong>Fee:</strong> Rs. ${appointmentDetails.fee}</p>
    <p>Please proceed with payment to confirm your booking.</p>
  `;

  const doctorContent = `
    <h2>New Appointment</h2>
    <p>You have a new appointment!</p>
    <p><strong>Patient:</strong> ${appointmentDetails.patientName}</p>
    <p><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</p>
    <p>Please be available at the scheduled time.</p>
  `;

  await sendEmailNotification(
    patientEmail,
    "Appointment Confirmed - Smart Healthcare",
    patientContent
  );

  await sendEmailNotification(
    doctorEmail,
    "New Appointment - Smart Healthcare",
    doctorContent
  );
};

export const sendPaymentSuccessEmail = async (patientEmail, paymentDetails) => {
  const content = `
    <h2>Payment Successful</h2>
    <p>Your payment has been processed successfully!</p>
    <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
    <p><strong>Amount:</strong> Rs. ${paymentDetails.amount}</p>
    <p><strong>Appointment Date:</strong> ${paymentDetails.appointmentDate}</p>
    <p>You can now proceed with your consultation.</p>
  `;

  await sendEmailNotification(
    patientEmail,
    "Payment Successful - Smart Healthcare",
    content
  );
};

export const sendConsultationReminderEmail = async (patientEmail, doctorEmail, consultationDetails) => {
  const patientContent = `
    <h2>Consultation Reminder</h2>
    <p>Your consultation is scheduled for:</p>
    <p><strong>Date & Time:</strong> ${consultationDetails.dateTime}</p>
    <p><strong>Doctor:</strong> ${consultationDetails.doctorName}</p>
    <p><a href="${consultationDetails.videoLink}">Join Video Consultation</a></p>
  `;

  const doctorContent = `
    <h2>Consultation Reminder</h2>
    <p>You have a consultation scheduled for:</p>
    <p><strong>Date & Time:</strong> ${consultationDetails.dateTime}</p>
    <p><strong>Patient:</strong> ${consultationDetails.patientName}</p>
    <p><a href="${consultationDetails.videoLink}">Join Video Consultation</a></p>
  `;

  await sendEmailNotification(
    patientEmail,
    "Consultation Reminder - Smart Healthcare",
    patientContent
  );

  await sendEmailNotification(
    doctorEmail,
    "Consultation Reminder - Smart Healthcare",
    doctorContent
  );
};
