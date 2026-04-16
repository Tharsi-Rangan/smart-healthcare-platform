import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPatientPayments, initiatePayment } from '../../services/paymentApi';
import { useAuth } from '../../features/auth/AuthContext';

const statusConfig = {
  completed: { label: '✓ Paid',    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  pending:   { label: '◷ Pending', color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  failed:    { label: '✗ Failed',  color: 'text-red-500',     bg: 'bg-red-50 border-red-200' },
  refunded:  { label: '↩ Refunded',color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
};

function PaymentsPage() {
  const { user }  = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [payModal, setPayModal]     = useState(null);
  const [paying, setPaying]         = useState(false);
  const [successMsg, setSuccess]    = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payhere');

  useEffect(() => { fetchPayments(); }, []);

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
      setPayments(res.data?.payments || []);
    } catch {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-sm text-slate-500">View your payment history and transactions</p>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
          {successMsg}
        </div>
      )}

      {/* Summary card */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Spent',    value: `LKR ${total.toLocaleString()}`, color: 'text-teal-600',    bg: 'bg-teal-50' },
          { label: 'Completed',      value: payments.filter(p => p.status === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending',        value: payments.filter(p => p.status === 'pending').length,   color: 'text-amber-600',   bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-slate-200 ${s.bg} p-5`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Payment list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse h-20 rounded-2xl border bg-white" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No payment history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => {
            const cfg = statusConfig[payment.status] || statusConfig.pending;
            const isPending = payment.status === 'pending';
            
            return (
              <div key={payment._id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{payment.doctorName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()} •{' '}
                      <span className="capitalize">{payment.paymentMethod}</span>
                      {payment.transactionId && ` • ${payment.transactionId}`}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">LKR {payment.amount.toLocaleString()}</p>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {isPending && (
                    <button
                      onClick={() => setPayModal({ 
                        _id: payment.appointmentId,
                        doctorName: payment.doctorName,
                        consultationFee: payment.amount,
                        doctorId: payment.doctorId,
                        doctorAuthId: payment.doctorId,
                      })}
                      className="whitespace-nowrap px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Now modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Complete Payment</h2>
            <p className="text-sm text-slate-500 mb-5">
              Pay for your consultation with <strong>{payModal.doctorName}</strong>
            </p>

            <div className="rounded-xl bg-slate-50 p-4 mb-5 space-y-2 text-sm">
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
                <span className="font-bold text-teal-700 text-base">
                  LKR {(payModal.consultationFee || 1500).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-5">
              <p className="text-xs font-semibold text-slate-600 uppercase">Select Payment Method</p>
              
              <label className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition ${
                paymentMethod === 'payhere' 
                  ? 'border-teal-600 bg-teal-50' 
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

            <div className={`rounded-xl border px-3 py-2 text-xs mb-5 ${
              paymentMethod === 'dummy'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              {paymentMethod === 'dummy' 
                ? '⚡ Test mode: Payment will be instantly confirmed without redirecting to PayHere'
                : '🔒 You will be redirected to PayHere for secure payment processing'
              }
            </div>

            <div className="flex gap-3">
              <button onClick={() => handlePay(payModal)} disabled={paying}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  paymentMethod === 'dummy'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}>
                {paying ? 'Processing...' : `Pay ${paymentMethod === 'dummy' ? '(Test)' : 'via PayHere'}`}
              </button>
              <button onClick={() => { setPayModal(null); setPaymentMethod('payhere'); }}
                className="px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
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
