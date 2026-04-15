import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAppointmentAndPayment();
  }, [appointmentId]);

  const fetchAppointmentAndPayment = async () => {
    try {
      // Fetch appointment details
      const appointmentResponse = await axios.get(
        `http://localhost:3002/api/appointments/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointment(appointmentResponse.data.data);

      // Fetch payment status
      try {
        const paymentResponse = await axios.get(
          `http://localhost:3004/api/payments/status/${appointmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayment(paymentResponse.data.data);
      } catch (err) {
        // Payment not yet initiated
        console.log("Payment not yet initiated");
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch details");
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      setPaymentProcessing(true);
      const response = await axios.post(
        "http://localhost:3004/api/payments/initiate",
        {
          appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          amount: appointment.consultationFee,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPayment(response.data.data);
      setPaymentProcessing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setPaymentProcessing(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    try {
      setPaymentProcessing(true);

      // Simulate payment success
      const response = await axios.post(
        "http://localhost:3004/api/payments/success",
        {
          appointmentId,
          transactionId: `TXN-${Date.now()}`,
          patientEmail: appointment.patientEmail,
        }
      );

      setPayment(response.data.data);
      alert("Payment successful! Consultation created.");
      navigate(`/consultation/${appointmentId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process payment");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <div className="payment-loading">Loading...</div>;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Payment</h1>

        {error && <div className="error-alert">{error}</div>}

        <div className="appointment-details">
          <h2>Appointment Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Doctor:</span>
              <span className="value">{appointment?.doctorName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Date & Time:</span>
              <span className="value">
                {new Date(appointment?.appointmentTime).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Consultation Fee:</span>
              <span className="value fee">
                Rs. {appointment?.consultationFee}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value">
                <span className={`status ${appointment?.status}`}>
                  {appointment?.status}
                </span>
              </span>
            </div>
          </div>
        </div>

        {!payment ? (
          <div className="payment-initiation">
            <h2>Initiate Payment</h2>
            <p>Click the button below to start the payment process.</p>
            <button
              onClick={initiatePayment}
              className="btn btn-primary btn-large"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? "Processing..." : "Initiate Payment"}
            </button>
          </div>
        ) : (
          <div className="payment-info">
            <h2>Payment Information</h2>
            <div className="payment-details">
              <p>
                <strong>Transaction ID:</strong> {payment.transactionId}
              </p>
              <p>
                <strong>Amount:</strong> Rs. {payment.amount}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`payment-status ${payment.status}`}>
                  {payment.status}
                </span>
              </p>
            </div>

            {payment.status === "pending" && (
              <div className="payment-actions">
                {payment.paymentLink && (
                  <a
                    href={payment.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-large"
                  >
                    Pay Now
                  </a>
                )}

                {/* For demo purposes - simulate payment success */}
                <button
                  onClick={simulatePaymentSuccess}
                  className="btn btn-secondary btn-large"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? "Processing..." : "Simulate Payment Success"}
                </button>
              </div>
            )}

            {payment.status === "paid" && (
              <div className="payment-success">
                <div className="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p>Your payment has been processed successfully.</p>
                <p>Consultation has been created. You can now join the video consultation.</p>
                <button
                  onClick={() =>
                    navigate(`/consultation/${appointmentId}`)
                  }
                  className="btn btn-primary btn-large"
                >
                  Go to Consultation
                </button>
              </div>
            )}

            {payment.status === "failed" && (
              <div className="payment-failed">
                <p className="error-text">Payment failed: {payment.failureReason}</p>
                <button
                  onClick={initiatePayment}
                  className="btn btn-primary btn-large"
                  disabled={paymentProcessing}
                >
                  Retry Payment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
