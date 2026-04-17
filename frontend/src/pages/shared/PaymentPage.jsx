import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import apiClient from "../../services/apiClient";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  ArrowLeft,
  Loader,
  FileText,
  User,
  Calendar,
  Stethoscope,
} from "lucide-react";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load appointment and payment details
  useEffect(() => {
    loadPaymentDetails();
  }, [appointmentId, user?.id]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading payment details for appointment:", appointmentId);

      // Fetch appointment
      try {
        const apptResponse = await apiClient.get(
          `/api/appointments/${appointmentId}`
        );
        const appointmentData = apptResponse.data?.data || apptResponse.data;
        console.log("Appointment data:", appointmentData);
        setAppointment(appointmentData);
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Unable to load appointment details");
        return;
      }

      // Fetch payment status
      try {
        const paymentResponse = await apiClient.get(
          `/api/payments/status/${appointmentId}`
        );
        const paymentData = paymentResponse.data?.data || paymentResponse.data;
        console.log("Payment data:", paymentData);
        setPayment(paymentData);
      } catch (err) {
        console.log("Payment not initiated yet:", err.message);
        setPayment(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading payment details:", err);
      setError(err.response?.data?.message || "Failed to load payment details");
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!appointment) {
      setError("Appointment details not loaded");
      return;
    }

    try {
      setPaymentProcessing(true);
      setError(null);

      console.log("Initiating payment with data:", {
        appointmentId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        amount: appointment.consultationFee,
        patientEmail: user?.email || "",
        patientPhone: user?.phone || "",
        patientName: user?.name || "",
      });

      const response = await apiClient.post("/api/payments/initiate", {
        appointmentId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        amount: appointment.consultationFee || 500,
        currency: "LKR",
        patientEmail: user?.email || "",
        patientPhone: user?.phone || "",
        patientName: user?.name || "",
        paymentMethod: "payhere",
      });

      console.log("Payment initiated response:", response.data);
      const paymentData = response.data?.data?.payment;
      setPayment(paymentData);
      setSuccessMessage("Payment initiated. Redirecting to PayHere...");

      // Wait briefly to show success message
      setTimeout(() => {
        proceedWithPayHere(response.data?.data?.payhereData);
      }, 1000);
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(
        err.response?.data?.message || "Failed to initiate payment. Please try again."
      );
      setPaymentProcessing(false);
    }
  };

  const proceedWithPayHere = (payhereData) => {
    if (!payhereData) {
      setError("PayHere configuration not available");
      setPaymentProcessing(false);
      return;
    }

    try {
      // Check if PayHere script is loaded, with retry logic
      if (typeof window.payhere === "undefined") {
        console.error("PayHere SDK not loaded, attempting to wait...");
        
        // Try to wait for SDK to load
        const checkPayHere = setInterval(() => {
          if (typeof window.payhere !== "undefined") {
            clearInterval(checkPayHere);
            console.log("PayHere SDK loaded, proceeding with payment");
            window.payhere.startPayment(payhereData);
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkPayHere);
          if (typeof window.payhere === "undefined") {
            setError(
              "PayHere payment gateway is not available. Please refresh the page and try again."
            );
            setPaymentProcessing(false);
          }
        }, 5000);
        
        return;
      }

      console.log("Initiating PayHere payment with data:", payhereData);

      // PayHere payment handler
      window.payhere.startPayment(payhereData);
    } catch (err) {
      console.error("Error with PayHere:", err);
      setError("Failed to initialize PayHere payment gateway");
      setPaymentProcessing(false);
    }
  };

  const simulatePaymentForTesting = async () => {
    try {
      setPaymentProcessing(true);
      setError(null);

      if (!payment?._id) {
        setError("Payment record not found");
        setPaymentProcessing(false);
        return;
      }

      const response = await apiClient.post("/api/payments/confirm", {
        paymentId: payment._id,
        transactionId: `TEST-${Date.now()}`,
        patientEmail: user?.email || "",
      });

      console.log("Payment confirmed:", response.data);
      setPayment(response.data?.data || response.data);
      setSuccessMessage(
        "Test payment completed successfully! Awaiting admin approval..."
      );
      setPaymentProcessing(false);
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError(err.response?.data?.message || "Failed to confirm payment");
      setPaymentProcessing(false);
    }
  };

  // PayHere callback handlers (global)
  useEffect(() => {
    window.paymentCompleted = (orderId) => {
      console.log("Payment completed for order:", orderId);
      loadPaymentDetails();
      setSuccessMessage("Payment completed! Awaiting admin approval...");
    };

    window.paymentFailed = (orderId) => {
      console.log("Payment failed for order:", orderId);
      setError("Payment failed. Please try again.");
      setPaymentProcessing(false);
    };

    return () => {
      delete window.paymentCompleted;
      delete window.paymentFailed;
    };
  }, []);

  // Render states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-cyan-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-red-700 mb-2">
                  Unable to Load Appointment
                </h2>
                <p className="text-red-600 mb-4">
                  {error || "The appointment details could not be found. Please check the appointment ID and try again."}
                </p>
                <button
                  onClick={() => navigate("/patient/appointments")}
                  className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Back to Appointments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaymentCompleted = payment?.status === "completed";
  const isPaymentPending = payment?.status === "pending";
  const isAdminApproved = payment?.adminStatus === "approved";
  const isAdminRejected = payment?.adminStatus === "rejected";
  const isAwaitingApproval = payment?.status === "completed" && payment?.adminStatus === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Payment</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-red-700">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-emerald-700">
              <p className="font-semibold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Appointment Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <FileText className="text-cyan-600" size={24} />
            <h2 className="text-xl font-semibold text-slate-800">Appointment Details</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Appointment ID
              </p>
              <p className="text-slate-800 font-medium break-all">{appointmentId}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  appointment.status === "confirmed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {appointment.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1">
                <Stethoscope size={14} />
                Doctor
              </p>
              <p className="text-slate-800 font-medium">{appointment.doctorName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1">
                <Calendar size={14} />
                Date & Time
              </p>
              <p className="text-slate-800 font-medium">
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Consultation Type
              </p>
              <p className="text-slate-800 font-medium capitalize">
                {appointment.consultationType}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Consultation Fee
              </p>
              <p className="text-lg font-bold text-cyan-600">
                LKR {(appointment.consultationFee || 500).toLocaleString("en-LK")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        {payment && (
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isAdminApproved
              ? "bg-emerald-50 border-emerald-200"
              : isAdminRejected
              ? "bg-red-50 border-red-200"
              : isAwaitingApproval
              ? "bg-amber-50 border-amber-200"
              : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b"
              style={{
                borderColor: isAdminApproved
                  ? "#86efac"
                  : isAdminRejected
                  ? "#fca5a5"
                  : isAwaitingApproval
                  ? "#fcd34d"
                  : "#93c5fd",
              }}>
              {isAdminApproved ? (
                <CheckCircle className="text-emerald-600" size={24} />
              ) : isAdminRejected ? (
                <AlertCircle className="text-red-600" size={24} />
              ) : (
                <Clock className="text-amber-600" size={24} />
              )}
              <h2 className={`text-xl font-semibold ${
                isAdminApproved
                  ? "text-emerald-800"
                  : isAdminRejected
                  ? "text-red-800"
                  : "text-amber-800"
              }`}>
                {isAdminApproved
                  ? "✓ Payment Approved"
                  : isAdminRejected
                  ? "✗ Payment Rejected"
                  : isAwaitingApproval
                  ? "⏳ Awaiting Admin Approval"
                  : "Payment Status"}
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  Transaction ID
                </p>
                <p className="font-medium break-all">{payment.transactionId || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  Payment Status
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-60 capitalize">
                  {payment.status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  Admin Status
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  payment.adminStatus === "approved"
                    ? "bg-emerald-200 text-emerald-700"
                    : payment.adminStatus === "rejected"
                    ? "bg-red-200 text-red-700"
                    : "bg-amber-200 text-amber-700"
                }`}>
                  {payment.adminStatus}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  Amount
                </p>
                <p className="text-lg font-bold">
                  LKR {(payment.amount || 500).toLocaleString("en-LK")}
                </p>
              </div>
            </div>

            {payment.rejectionReason && (
              <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                  Rejection Reason
                </p>
                <p className="text-sm">{payment.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Actions */}
        {!payment && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <CreditCard className="text-cyan-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-800">Initiate Payment</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600">
                Click the button below to proceed to PayHere payment gateway. You will be redirected to complete the payment securely.
              </p>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600">
                  <strong>Payment Amount:</strong> LKR {(appointment.consultationFee || 500).toLocaleString("en-LK")}
                </p>
              </div>

              <button
                onClick={initiatePayment}
                disabled={paymentProcessing}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceed to PayHere
                  </>
                )}
              </button>

              {/* Testing helper - remove in production */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => {
                    if (confirm("Simulate payment completion for testing?")) {
                      initiatePayment();
                      setTimeout(() => simulatePaymentForTesting(), 1500);
                    }
                  }}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  [TEST] Simulate Payment
                </button>
              )}
            </div>
          </div>
        )}

        {/* Payment Completed - Awaiting Approval */}
        {isAwaitingApproval && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <Clock className="text-amber-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-800">Awaiting Admin Approval</h2>
            </div>

            <div className="space-y-3 text-slate-700">
              <p className="text-sm">
                Your payment has been completed successfully! An administrator will review and approve your payment shortly.
              </p>
              <p className="text-sm">
                Once approved, you will be able to start your video consultation.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                Transaction ID: {payment.transactionId}
              </p>
            </div>

            <button
              onClick={loadPaymentDetails}
              className="mt-4 w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Refresh Status
            </button>
          </div>
        )}

        {/* Payment Approved - Ready for Consultation */}
        {isAdminApproved && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <CheckCircle className="text-emerald-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-800">
                ✓ Payment Approved
              </h2>
            </div>

            <div className="space-y-3 text-slate-700 mb-6">
              <p className="text-sm">
                Your payment has been approved! You can now join your video consultation.
              </p>
              <p className="text-xs text-slate-500 pt-2">
                Transaction ID: {payment.transactionId}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate(`/patient/video-consultation/${appointmentId}`)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Start Consultation
              </button>
              <button
                onClick={() => navigate("/patient/payments")}
                className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition"
              >
                View All Payments
              </button>
            </div>
          </div>
        )}

        {/* Payment Rejected */}
        {isAdminRejected && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-800">✗ Payment Rejected</h2>
            </div>

            <div className="space-y-3 text-slate-700 mb-6">
              <p className="text-sm text-red-700 font-medium">
                Your payment has been rejected by the administrator.
              </p>
              {payment.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Reason:</p>
                  <p className="text-sm text-red-700">{payment.rejectionReason}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setPayment(null);
                setError(null);
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Try Payment Again
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Frequently Asked Questions</h3>

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-800 mb-1">
                What happens after I pay?
              </p>
              <p>
                Your payment will be reviewed and approved by an administrator within a few minutes. Once approved, you'll be able to start your video consultation.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 mb-1">
                Is PayHere payment secure?
              </p>
              <p>
                Yes, PayHere is a trusted payment gateway in Sri Lanka with PCI-DSS compliance and secure encryption for all transactions.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 mb-1">
                What payment methods does PayHere accept?
              </p>
              <p>
                PayHere accepts Credit Cards, Debit Cards, Dialog, Mobitel, Hutch, and Dialog Axiata mobile payments.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 mb-1">
                Can I cancel the payment?
              </p>
              <p>
                You can cancel before completing payment on PayHere. After completion, contact the administrator for refund requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
