import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

function PayHerePaymentGateway({ appointmentId, amount, doctorName, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payhereData, setPayhereData] = useState(null);

  const handlePayNow = async () => {
    setLoading(true);
    setError('');

    try {
      // Initiate payment on backend
      const response = await apiClient.post('/api/payments/initiate', {
        appointmentId,
        doctorId: 'doctor_id_placeholder', // Will be passed from parent
        doctorName,
        amount,
        currency: 'LKR',
        paymentMethod: 'payhere',
      });

      if (response.data?.data?.payhereData) {
        setPayhereData(response.data.data.payhereData);
        
        // Load PayHere checkout
        if (window.PAYHERE) {
          const request = response.data.data.payhereData;
          window.PAYHERE.startCheckout(request);
        } else {
          setError('PayHere SDK not loaded');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load PayHere SDK
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handlePayNow}
        disabled={loading}
        className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay Now (LKR ${amount})`}
      </button>

      <p className="text-xs text-slate-500">
        Powered by PayHere • Secure payment gateway • Payment pending admin approval
      </p>
    </div>
  );
}

export default PayHerePaymentGateway;
