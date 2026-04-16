import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'MediConnect <noreply@mediconnect.lk>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failure shouldn't break the main flow
  }
};

export const appointmentBookedEmail = (patientName, date, timeSlot, reason) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
  <div style="text-align:center;margin-bottom:20px;">
    <h2 style="color:#0f766e;margin:0;">MediConnect</h2>
    <p style="color:#64748b;font-size:14px;">Your health, our priority</p>
  </div>
  <h3 style="color:#1e293b;">New Appointment Request 📅</h3>
  <p style="color:#475569;">You have received a new appointment booking.</p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:4px 0;color:#334155;"><strong>Patient:</strong> ${patientName}</p>
    <p style="margin:4px 0;color:#334155;"><strong>Date:</strong> ${date}</p>
    <p style="margin:4px 0;color:#334155;"><strong>Time:</strong> ${timeSlot}</p>
    <p style="margin:4px 0;color:#334155;"><strong>Reason:</strong> ${reason}</p>
  </div>
  <p style="color:#64748b;font-size:13px;">Please log in to your dashboard to manage your appointments.</p>
</div>
`;

export const appointmentConfirmationEmail = (patientName, doctorName, date, timeSlot) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
  <div style="text-align:center;margin-bottom:20px;">
    <h2 style="color:#0f766e;margin:0;">MediConnect</h2>
    <p style="color:#64748b;font-size:14px;">Your health, our priority</p>
  </div>
  <h3 style="color:#1e293b;">Appointment Confirmed ✓</h3>
  <p style="color:#475569;">Hi <strong>${patientName}</strong>,</p>
  <p style="color:#475569;">Your appointment has been confirmed.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:4px 0;color:#166534;"><strong>Doctor:</strong> ${doctorName}</p>
    <p style="margin:4px 0;color:#166534;"><strong>Date:</strong> ${date}</p>
    <p style="margin:4px 0;color:#166534;"><strong>Time:</strong> ${timeSlot}</p>
  </div>
  <p style="color:#64748b;font-size:13px;">Please join on time. If you need to cancel, do so at least 2 hours before.</p>
</div>
`;

export const paymentConfirmationEmail = (patientName, doctorName, amount, transactionId) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
  <h2 style="color:#0f766e;">MediConnect — Payment Receipt</h2>
  <p>Hi <strong>${patientName}</strong>, your payment was successful.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:4px 0;"><strong>Doctor:</strong> ${doctorName}</p>
    <p style="margin:4px 0;"><strong>Amount:</strong> LKR ${amount}</p>
    <p style="margin:4px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
  </div>
</div>
`;
