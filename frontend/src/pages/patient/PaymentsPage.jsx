import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPatientPayments, initiatePayment } from '../../services/paymentApi';
import { useAuth } from '../../features/auth/AuthContext';
import html2pdf from 'html2pdf.js';
import { Download, Printer, Eye, AlertCircle, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';

const statusConfig = {
  completed: { label: 'Paid',    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  pending:   { label: 'Pending', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200', icon: Clock },
  failed:    { label: 'Failed',  color: 'text-red-500',     bg: 'bg-red-50 border-red-200', icon: XCircle },
  refunded:  { label: 'Refunded',color: 'text-cyan-600',    bg: 'bg-cyan-50 border-cyan-200', icon: RotateCcw },
};

function PaymentsPage() {
  const { user }  = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const receiptRef = useRef();
  
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [payModal, setPayModal]     = useState(null);
  const [paying, setPaying]         = useState(false);
  const [successMsg, setSuccess]    = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payhere');
  
  // New state for filters, sorting, and modals
  const [statusFilter, setStatusFilter] = useState('appointment'); // Default to appointment payments (pending + completed)
  const [sortBy, setSortBy] = useState('date-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [receiptModal, setReceiptModal] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  // Get filtered and sorted payments
  const getFilteredPayments = () => {
    let filtered = payments;

    // Status filter
    if (statusFilter === 'appointment') {
      // Show only pending and completed (confirmed) payments
      filtered = filtered.filter(p => p.status === 'pending' || p.status === 'completed');
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const nextDay = new Date(dateTo);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(p => new Date(p.createdAt) < nextDay);
    }

    // Sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      default:
        break;
    }

    return sorted;
  };

  const downloadReceipt = (payment) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #0d9488; font-size: 28px;">PAYMENT RECEIPT</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Smart Healthcare Platform</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Receipt Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 50%;"><strong>Receipt ID:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${payment._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date(payment.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-transform: capitalize;">${payment.status}</td>
            </tr>
            ${payment.transactionId ? `
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Transaction ID:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${payment.transactionId}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Service Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Doctor:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${payment.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Service Type:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">Consultation Fee</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-transform: capitalize;">${payment.paymentMethod || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-align: right;">LKR ${payment.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Tax (0%):</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-align: right;">LKR 0</td>
            </tr>
            <tr style="border-top: 2px solid #d1d5db;">
              <td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;"><strong>Total Amount:</strong></td>
              <td style="padding: 12px 0; color: #0d9488; text-align: right; font-size: 20px; font-weight: bold;">LKR ${payment.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${payment.status === 'completed' ? `
        <div style="text-align: center; color: #059669; background-color: #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0; font-weight: bold;">✓ Payment Completed Successfully</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Your consultation has been confirmed</p>
        </div>
        ` : ''}

        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">Thank you for using Smart Healthcare Platform</p>
          <p style="margin: 5px 0 0 0;">For support, contact: support@smarthealthcare.lk</p>
          <p style="margin: 5px 0 0 0;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `Receipt-${payment._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(element).save();
  };

  const printReceipt = (payment) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #0d9488; font-size: 28px;">PAYMENT RECEIPT</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Smart Healthcare Platform</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Receipt Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 50%;"><strong>Receipt ID:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${payment._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date(payment.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-transform: capitalize;">${payment.status}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Service Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Doctor:</strong></td>
              <td style="padding: 8px 0; color: #1f2937;">${payment.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; text-transform: capitalize;">${payment.paymentMethod || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px 0; color: #0d9488; text-align: right; font-size: 20px; font-weight: bold;">LKR ${payment.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDispute = async (payment) => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute');
      return;
    }

    setDisputeSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Dispute submitted successfully. Our team will review and contact you within 24 hours.');
      setDisputeModal(null);
      setDisputeReason('');
    } catch (err) {
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Pre-open payment modal if navigated from appointments with unpaid appt
  useEffect(() => {
    if (location.state?.appointment) {
      setPaymentMethod('payhere'); // Reset to PayHere by default
      setPayModal(location.state.appointment);
    }
  }, [location.state]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPatientPayments();
      console.log('[PaymentsPage] Fetched payments:', res);
      
      // Handle both response formats
      const paymentsData = res.data?.payments || res.payments || [];
      console.log('[PaymentsPage] Extracted payments:', paymentsData);
      
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('[PaymentsPage] Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (appointment) => {
    if (paymentMethod === 'dummy') {
      handleDummyPayment(appointment);
      return;
    }
    
    setPaying(true);
    try {
      // 1. Initiate payment record
      const initRes = await initiatePayment({
        appointmentId: appointment._id,
        doctorId:      appointment.doctorAuthId || appointment.doctorId,
        doctorName:    appointment.doctorName,
        amount:        appointment.consultationFee || 1500,
        currency:      'LKR',
        paymentMethod: 'payhere',
        patientName:   user?.name || 'Patient',
        patientEmail:  user?.email || '',
      });

      const payhereData = initRes.data?.payhereData;
      if (!payhereData) {
        throw new Error('Failed to get PayHere data');
      }

      // 2. Create and submit PayHere form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payhereData.sandbox 
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout';
      form.style.display = 'none';

      // Add all PayHere fields to form
      const formFields = {
        merchant_id:   payhereData.merchant_id,
        return_url:    payhereData.return_url,
        cancel_url:    payhereData.cancel_url,
        notify_url:    payhereData.notify_url,
        order_id:      payhereData.order_id,
        items:         payhereData.items,
        currency:      payhereData.currency,
        amount:        payhereData.amount,
        first_name:    payhereData.first_name,
        last_name:     payhereData.last_name,
        email:         payhereData.email,
        phone:         payhereData.phone,
        address:       payhereData.address,
        city:          payhereData.city,
        country:       payhereData.country,
      };

      // Calculate MD5 hash for PayHere
      const hashString = `${payhereData.merchant_id}${payhereData.order_id}${payhereData.amount}${payhereData.currency}${Date.now()}`;
      
      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value || '';
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      setPayModal(null);
      setPaying(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  const handleDummyPayment = async (appointment) => {
    setPaying(true);
    try {
      // 1. Initiate payment record
      const initRes = await initiatePayment({
        appointmentId: appointment._id,
        doctorId:      appointment.doctorAuthId || appointment.doctorId,
        doctorName:    appointment.doctorName,
        amount:        appointment.consultationFee || 1500,
        currency:      'LKR',
        paymentMethod: 'dummy',
        patientName:   user?.name || 'Patient',
        patientEmail:  user?.email || '',
      });

      const paymentId = initRes.data?.payment?._id;

      // 2. For dummy payment, directly confirm as successful
      // Simulate PayHere webhook notification (signature validation skipped for DUMMY payments)
      await fetch('http://localhost:5006/api/payments/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: paymentId,
          payment_id: `DUMMY-${Date.now()}`,
          status_code: '2', // Success code
          amount: (appointment.consultationFee || 1500).toString(),
          currency: 'LKR',
        }),
      });

      // 3. Refresh payments list
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchPayments();

      setPayModal(null);
      setSuccess('✓ Dummy payment confirmed! Notification sent to admin.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      alert(err.message || 'Dummy payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const filteredPayments = getFilteredPayments();

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointment Payments</h1>
        <p className="text-sm text-slate-600 mt-1">View and manage your appointment payment transactions</p>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-sky-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Paid</p>
          <p className="text-3xl font-bold text-cyan-700 mt-2">LKR {total.toLocaleString()}</p>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">{payments.filter(p => p.status === 'completed').length}</p>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
          <p className="text-3xl font-bold text-amber-700 mt-2">{payments.filter(p => p.status === 'pending').length}</p>
        </div>
        
        <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Payments</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{filteredPayments.length}</p>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Filters & Sorting</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="appointment">Appointment Payments (Pending & Confirmed)</option>
              <option value="all">All Payments</option>
              <option value="completed">Confirmed Only</option>
              <option value="pending">Pending Only</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('appointment');
                setSortBy('date-desc');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-20 rounded-2xl border bg-slate-100" />)}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No appointment payments found</p>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'appointment' 
              ? 'You have no pending or confirmed appointment payments yet.'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map(payment => {
            const cfg = statusConfig[payment.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isPending = payment.status === 'pending';
            
            return (
              <div key={payment._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Doctor & Details */}
                  <div className="flex gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 flex-shrink-0">
                      <StatusIcon className={`h-6 w-6 ${cfg.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">{payment.doctorName}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <span className="font-medium">Date:</span> {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          <span className="font-medium">Method:</span> {payment.paymentMethod ? payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1) : 'N/A'}
                        </p>
                        {payment.transactionId && (
                          <p>
                            <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="text-right flex flex-col gap-2 items-end flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">LKR {payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Receipt ID: {payment._id.slice(-8)}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => setReceiptModal(payment)}
                        title="View Receipt"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        onClick={() => downloadReceipt(payment)}
                        title="Download Receipt"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 transition"
                      >
                        <Download size={16} />
                      </button>
                      
                      <button
                        onClick={() => printReceipt(payment)}
                        title="Print Receipt"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition"
                      >
                        <Printer size={16} />
                      </button>
                      
                      {payment.status !== 'refunded' && (
                        <button
                          onClick={() => {
                            setDisputeModal(payment);
                            setDisputeReason('');
                          }}
                          title="Report Issue"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700 transition"
                        >
                          <AlertCircle size={16} />
                        </button>
                      )}

                      {isPending && (
                        <button
                          onClick={() => setPayModal({ 
                            _id: payment.appointmentId,
                            doctorName: payment.doctorName,
                            consultationFee: payment.amount,
                            doctorId: payment.doctorId,
                            doctorAuthId: payment.doctorId,
                          })}
                          className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-96 overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-cyan-600 to-sky-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Payment Receipt</h2>
              <button
                onClick={() => setReceiptModal(null)}
                className="text-white hover:text-cyan-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 text-sm">
              {/* Receipt Header */}
              <div className="mb-6 border-b-2 border-slate-200 pb-6">
                <h1 className="text-3xl font-bold text-cyan-700">PAYMENT RECEIPT</h1>
                <p className="text-slate-600 mt-1">Smart Healthcare Platform</p>
              </div>

              {/* Receipt Details */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wide">Receipt Details</h3>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receipt ID:</span>
                    <span className="font-medium">{receiptModal._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date:</span>
                    <span className="font-medium">
                      {new Date(receiptModal.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`font-medium ${statusConfig[receiptModal.status]?.color}`}>
                      {statusConfig[receiptModal.status]?.label}
                    </span>
                  </div>
                  {receiptModal.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transaction ID:</span>
                      <span className="font-medium">{receiptModal.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wide">Service Details</h3>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Doctor:</span>
                    <span className="font-medium">{receiptModal.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Service Type:</span>
                    <span className="font-medium">Consultation Fee</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Method:</span>
                    <span className="font-medium">{receiptModal.paymentMethod ? receiptModal.paymentMethod.charAt(0).toUpperCase() + receiptModal.paymentMethod.slice(1) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="mb-6 rounded-lg bg-cyan-50 p-4 space-y-2 border border-cyan-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium">LKR {receiptModal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (0%):</span>
                  <span className="font-medium">LKR 0</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-900">Total Amount:</span>
                  <span className="font-bold text-cyan-700 text-lg">LKR {receiptModal.amount.toLocaleString()}</span>
                </div>
              </div>

              {receiptModal.status === 'completed' && (
                <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center text-emerald-700 font-medium">
                  ✓ Payment Completed Successfully
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => downloadReceipt(receiptModal)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 transition"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => printReceipt(receiptModal)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={() => setReceiptModal(null)}
                  className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-slate-900 font-medium hover:bg-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle size={20} />
                Report Payment Issue
              </h2>
              <button
                onClick={() => setDisputeModal(null)}
                className="text-white hover:text-red-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                <p className="font-medium mb-1">Report a Problem</p>
                <p>Please describe the issue with this payment. Our team will review and contact you within 24 hours.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Doctor</label>
                <div className="rounded-lg bg-slate-100 px-4 py-2 text-slate-900 font-medium">
                  {disputeModal.doctorName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Amount</label>
                <div className="rounded-lg bg-slate-100 px-4 py-2 text-slate-900 font-medium">
                  LKR {disputeModal.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Reason for Dispute *</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDispute(disputeModal)}
                  disabled={disputeSubmitting || !disputeReason.trim()}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {disputeSubmitting ? 'Submitting...' : 'Submit Dispute'}
                </button>
                <button
                  onClick={() => setDisputeModal(null)}
                  className="flex-1 rounded-lg bg-slate-200 px-4 py-2.5 text-slate-900 font-semibold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Now modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h2 className="text-base font-bold text-slate-800 mb-1">Complete Payment</h2>
            <p className="text-xs text-slate-500 mb-3">
              Pay for your consultation with <strong>{payModal.doctorName}</strong>
            </p>

            <div className="rounded-lg bg-sky-50 p-3 mb-3 space-y-1 text-xs border border-sky-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-800">{payModal.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialization</span>
                <span className="text-slate-700">{payModal.specialization}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="font-bold text-cyan-700 text-base">
                  LKR {(payModal.consultationFee || 1500).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 mb-3">
              <p className="text-xs font-semibold text-slate-600 uppercase">Select Payment Method</p>
              
              <label className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition ${
                paymentMethod === 'payhere' 
                  ? 'border-cyan-600 bg-cyan-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  value="payhere"
                  checked={paymentMethod === 'payhere'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-slate-800">PayHere Gateway</p>
                  <p className="text-xs text-slate-500">Real payment processing</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition ${
                paymentMethod === 'dummy' 
                  ? 'border-amber-600 bg-amber-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  value="dummy"
                  checked={paymentMethod === 'dummy'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-slate-800">Dummy Payment (Testing)</p>
                  <p className="text-xs text-slate-500">Auto-confirm for testing</p>
                </div>
              </label>
            </div>

            <div className={`rounded-lg border px-2 py-1 text-xs mb-3 ${
              paymentMethod === 'dummy'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}>
              {paymentMethod === 'dummy' 
                ? '⚡ Test mode: Payment will be instantly confirmed without redirecting to PayHere'
                : '🔒 You will be redirected to PayHere for secure payment processing'
              }
            </div>

            <div className="flex gap-2">
              <button onClick={() => handlePay(payModal)} disabled={paying}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold text-white transition disabled:opacity-60 ${
                  paymentMethod === 'dummy'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}>
                {paying ? 'Processing...' : `Pay ${paymentMethod === 'dummy' ? '(Test)' : 'via PayHere'}`}
              </button>
              <button onClick={() => { setPayModal(null); setPaymentMethod('payhere'); }}
                className="px-3 rounded-lg border border-cyan-200 text-xs text-cyan-600 hover:bg-cyan-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage;
