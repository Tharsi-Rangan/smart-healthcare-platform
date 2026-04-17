import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPatientPayments } from '../../services/paymentApi';

function PaymentReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Give PayHere webhook a moment to update the database
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch latest payments
        const response = await getPatientPayments();
        const payments = response.data?.payments || [];

        // Find the most recent pending->completed payment
        const completedPayment = payments.find(p => p.status === 'completed');

        if (completedPayment) {
          setStatus('success');
          setMessage('✓ Payment successful! Your payment has been processed and confirmed.');
          setTimeout(() => {
            navigate('/patient/payments');
          }, 3000);
        } else {
          setStatus('pending');
          setMessage('⏳ Payment is being verified. Please wait...');
          // Retry after 2 seconds
          setTimeout(checkPaymentStatus, 2000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error verifying payment. Please check your payment history.');
      }
    };

    checkPaymentStatus();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-sky-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          {status === 'checking' || status === 'pending' ? (
            <>
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Processing Payment</h1>
              <p className="text-slate-600">{message}</p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="mb-4 text-4xl">✓</div>
              <h1 className="text-xl font-bold text-emerald-600 mb-2">Payment Successful</h1>
              <p className="text-slate-600 mb-6">{message}</p>
              <p className="text-sm text-slate-500">Redirecting to payments page...</p>
            </>
          ) : (
            <>
              <div className="mb-4 text-4xl">✗</div>
              <h1 className="text-xl font-bold text-red-600 mb-2">Payment Error</h1>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/patient/payments')}
                className="rounded-xl bg-cyan-600 px-6 py-2 text-white font-medium hover:bg-cyan-700 transition"
              >
                Back to Payments
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentReturnPage;
