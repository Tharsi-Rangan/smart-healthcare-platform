import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { sendEmail, paymentConfirmationEmail } from '../utils/emailService.js';
import { sendSMS, sendWhatsApp } from '../utils/smsService.js';
import { validatePayhereSignature, getPayhereStatusMessage } from '../utils/payhereUtils.js';
import crypto from 'crypto';
import axios from 'axios';

// Helper function to fetch doctor details from doctor service
const fetchDoctorDetails = async (doctorId) => {
  try {
    const response = await axios.get(`http://localhost:5006/api/doctors/public/${doctorId}`, {
      timeout: 5000,
    });
    return response.data?.data?.doctor || null;
  } catch (error) {
    console.error('Error fetching doctor details:', error.message);
    return null;
  }
};

// POST /api/payments/initiate — patient initiates payment
export const initiatePayment = async (req, res) => {
  try {
    const {
      appointmentId, doctorId, doctorName, amount, currency,
      paymentMethod, patientName, patientEmail, patientPhone,
    } = req.body;

    // Validate required fields
    if (!appointmentId || !doctorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: appointmentId, doctorId' 
      });
    }

    // Check for existing completed payment for same appointment
    const existingCompleted = await Payment.findOne({ appointmentId, status: 'completed' });
    if (existingCompleted) {
      return res.status(409).json({ success: false, message: 'Payment already completed for this appointment.' });
    }

    // Delete any pending/failed payments for fresh attempt
    await Payment.deleteMany({ appointmentId, status: { $in: ['pending', 'failed'] } });

    // Fetch doctor details to get consultation fee and specialization
    const doctorDetails = await fetchDoctorDetails(doctorId);
    const consultationFee = doctorDetails?.consultationFee || amount || 500;
    const specialization = doctorDetails?.specialization || '';
    const finalDoctorName = doctorDetails?.doctorName || doctorName || 'Doctor';

    const payment = await Payment.create({
      appointmentId,
      patientId:   req.user.userId,
      patientName: patientName || req.user.name || 'Patient',
      patientEmail: patientEmail || req.user.email || '',
      patientPhone: patientPhone || '',
      doctorId,
      doctorName: finalDoctorName,
      specialization,
      consultationFee,
      amount: consultationFee,
      currency:      currency || 'LKR',
      paymentMethod: paymentMethod || 'payhere',
      status: 'pending',
    });

    // PayHere checkout data
    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1226148';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const sandbox = process.env.PAYHERE_SANDBOX === 'true';
    
    const payhereData = {
      merchant_id:   merchantId,
      return_url:    'http://localhost:5173/payment-return',
      cancel_url:    'http://localhost:5173/patient/payments',
      notify_url:    `http://localhost:5006/api/payments/notify`,
      order_id:      payment._id.toString(),
      items:         `Consultation with ${finalDoctorName}`,
      currency:      currency || 'LKR',
      amount:        consultationFee.toFixed(2),
      first_name:    (patientName?.split(' ')[0] || req.user.name?.split(' ')[0] || 'Patient'),
      last_name:     (patientName?.split(' ').slice(1).join(' ') || req.user.name?.split(' ').slice(1).join(' ') || ''),
      email:         patientEmail || req.user.email || '',
      phone:         patientPhone || '0771234567',
      address:       'Colombo',
      city:          'Colombo',
      country:       'Sri Lanka',
      sandbox:       sandbox,
    };

    // Calculate hash if merchant secret is provided
    if (merchantSecret) {
      const hashString = `${merchantId}${payhereData.order_id}${payhereData.amount}${payhereData.currency}${merchantSecret}`;
      payhereData.hash = crypto.createHash('md5').update(hashString).digest('hex');
    }

    res.status(201).json({
      success: true,
      message: 'Payment initiated.',
      data: { payment, payhereData },
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/confirm — manual confirmation (sandbox / cash)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, patientEmail } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    payment.status        = 'completed';
    payment.transactionId = transactionId || `TXN-${Date.now()}`;
    payment.paidAt        = new Date();
    await payment.save();

    // Create notification
    await Notification.create({
      userId:    payment.patientId,
      role:      'patient',
      title:     'Payment Successful',
      message:   `Your payment of LKR ${payment.amount} for consultation with ${payment.doctorName} was successful.`,
      type:      'payment',
      relatedId: payment._id.toString(),
    });

    // Send email receipt
    if (patientEmail) {
      await sendEmail({
        to:      patientEmail,
        subject: 'MediConnect — Payment Receipt',
        html:    paymentConfirmationEmail(payment.patientName, payment.doctorName, payment.amount, payment.transactionId),
      });
    }

    // Send SMS and WhatsApp
    const phoneToUse = payment.patientPhone; // Assuming confirmPayment uses what is saved
    if (phoneToUse) {
      const smsBody = `MediConnect: Payment of LKR ${payment.amount} for consultation with ${payment.doctorName} was successful.`;
      sendSMS({ to: phoneToUse, body: smsBody }).catch(err => console.error('SMS error:', err.message));
      sendWhatsApp({ to: phoneToUse, body: smsBody }).catch(err => console.error('WhatsApp error:', err.message));
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payment confirmed.', 
      data: { 
        payment,
        appointmentId: payment.appointmentId
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/notify — PayHere server-side notification
export const payhereNotify = async (req, res) => {
  try {
    const { order_id, status_code, payment_id, payhere_amount } = req.body;

    console.log('[PayHere] Webhook received:', { order_id, status_code, payment_id });

    // Validate signature (skip for dummy payments & optional if merchant secret not configured)
    const isDummyPayment = payment_id?.startsWith('DUMMY-');
    if (process.env.PAYHERE_MERCHANT_SECRET && !isDummyPayment) {
      const isValid = validatePayhereSignature(req);
      if (!isValid) {
        console.warn('[PayHere] Invalid signature for order:', order_id);
        return res.status(401).send('Unauthorized');
      }
    }

    const payment = await Payment.findById(order_id);
    if (!payment) {
      console.warn('[PayHere] Payment not found:', order_id);
      return res.status(404).send('Payment not found');
    }

    let newStatus = 'pending';
    let wasCompleted = false;

    if (status_code === '2') {
      // PayHere success code - payment completed
      newStatus = 'completed';
      wasCompleted = true;
    } else if (status_code === '-1' || status_code === '-2') {
      // PayHere cancel/failed code
      newStatus = 'failed';
    } else if (status_code === '1') {
      // PayHere authorized/pending
      newStatus = 'pending';
    }

    // Update payment record
    payment.status = newStatus;
    payment.transactionId = payment_id;
    payment.payhereStatus = status_code;
    payment.payhereMessage = getPayhereStatusMessage(status_code);
    if (wasCompleted) {
      payment.paidAt = new Date();
    }
    await payment.save();

    // Create notification if payment completed
    if (wasCompleted) {
      console.log('[PayHere] Payment completed, creating notification');
      
      const notification = await Notification.create({
        userId: payment.patientId,
        role: 'patient',
        title: '✓ Payment Successful',
        message: `Your payment of LKR ${payment.amount} for consultation with ${payment.doctorName} was successful.`,
        type: 'payment',
        relatedId: payment._id.toString(),
      });

      // Send email receipt
      if (payment.patientEmail) {
        try {
          await sendEmail({
            to: payment.patientEmail,
            subject: 'MediConnect — Payment Receipt',
            html: paymentConfirmationEmail(
              payment.patientName,
              payment.doctorName,
              payment.amount,
              payment.transactionId
            ),
          });
          console.log('[PayHere] Email sent to:', payment.patientEmail);
        } catch (emailError) {
          console.error('[PayHere] Email sending failed:', emailError.message);
          // Don't fail the webhook if email fails
        }
      }

      // Send SMS and WhatsApp
      if (payment.patientPhone) {
        const smsBody = `MediConnect: Payment of LKR ${payment.amount} for consultation with ${payment.doctorName} was successful.`;
        sendSMS({ to: payment.patientPhone, body: smsBody }).catch(err => console.error('SMS error:', err.message));
        sendWhatsApp({ to: payment.patientPhone, body: smsBody }).catch(err => console.error('WhatsApp error:', err.message));
      }
    }

    // Always respond with OK to PayHere
    res.status(200).send('OK');
  } catch (error) {
    console.error('[PayHere] Webhook error:', error.message);
    res.status(200).send('OK'); // Still return OK even on error to prevent PayHere retrying
  }
};

// GET /api/payments/patient — patient payment history
export const getPatientPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/admin — all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: { payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/admin/stats
export const getPaymentStats = async (req, res) => {
  try {
    const [total, completed, pending, failed] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
    ]);
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.status(200).json({
      success: true,
      data: { stats: { total, completed, pending, failed, revenue: revenue[0]?.total || 0 } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/payments/:id/approve — Admin approves payment
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    // Allow approval for both 'completed' and 'pending' payments
    // If pending, we confirm it as part of approval (admin verified payment externally)
    if (payment.status !== 'completed' && payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot approve ${payment.status} payments. Payment must be pending or completed.` 
      });
    }

    // If payment is pending, confirm it as part of approval
    if (payment.status === 'pending') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      console.log(`[Admin] Confirming pending payment ${id} as part of approval`);
    }

    payment.adminStatus = 'approved';
    payment.adminApprovedAt = new Date();
    payment.approvedBy = req.user.userId || 'admin';
    await payment.save();

    // Create notification for patient
    await Notification.create({
      userId: payment.patientId,
      role: 'patient',
      title: '✓ Payment Approved',
      message: `Your payment for consultation with ${payment.doctorName} has been approved. You can now start the video consultation.`,
      type: 'payment_approved',
      relatedId: payment._id.toString(),
    });

    // Send email notification
    if (payment.patientEmail) {
      try {
        await sendEmail({
          to: payment.patientEmail,
          subject: 'MediConnect — Payment Approved',
          html: `<p>Hi ${payment.patientName},</p><p>Your payment of LKR ${payment.amount} has been approved. You can now start the video consultation with ${payment.doctorName}.</p>`,
        });
      } catch (err) {
        console.error('Email error:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully.',
      data: { payment },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/payments/:id/reject — Admin rejects payment
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    // Allow rejection for both 'completed' and 'pending' payments
    if (payment.status !== 'completed' && payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot reject ${payment.status} payments. Payment must be pending or completed.` 
      });
    }

    payment.adminStatus = 'rejected';
    payment.rejectionReason = reason || 'Rejected by admin';
    payment.status = 'refunded';
    await payment.save();

    // Create notification for patient
    await Notification.create({
      userId: payment.patientId,
      role: 'patient',
      title: '✗ Payment Rejected',
      message: `Your payment has been rejected. Reason: ${reason || 'Not specified'}. Your refund will be processed shortly.`,
      type: 'payment_rejected',
      relatedId: payment._id.toString(),
    });

    // Send email notification
    if (payment.patientEmail) {
      try {
        await sendEmail({
          to: payment.patientEmail,
          subject: 'MediConnect — Payment Rejected',
          html: `<p>Hi ${payment.patientName},</p><p>Your payment of LKR ${payment.amount} has been rejected. Reason: ${reason || 'Not specified'}. Your refund will be processed shortly.</p>`,
        });
      } catch (err) {
        console.error('Email error:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment rejected successfully.',
      data: { payment },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/:id/status — Check payment status (by payment ID or appointmentId)
export const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by payment ID first, then by appointmentId
    let payment = await Payment.findById(id);
    if (!payment) {
      payment = await Payment.findOne({ appointmentId: id });
    }
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        appointmentId: payment.appointmentId,
        status: payment.status,
        adminStatus: payment.adminStatus,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
        adminApprovedAt: payment.adminApprovedAt,
        consultationAvailable: payment.status === 'completed' && payment.adminStatus === 'approved',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
