import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import apiClient from "../../services/apiClient";
import VideoConsultationRoom from "../../components/shared/VideoConsultationRoom";
import "./VideoRoomPage.css";

function VideoRoomPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointment details
        const appointmentRes = await apiClient.get(`/api/appointments/${appointmentId}`);
        setAppointment(appointmentRes.data.data);

        // Fetch payment status to verify consultation access
        try {
          const paymentRes = await apiClient.get(`/api/payments/status/${appointmentId}`);
          setPaymentStatus(paymentRes.data.data);
        } catch (err) {
          console.error("Failed to fetch payment status:", err);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load appointment details");
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);

  if (loading) {
    return <div className="video-room-loading">Loading consultation room...</div>;
  }

  if (error) {
    return (
      <div className="video-room-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/patient/appointments")}>
          Back to Appointments
        </button>
      </div>
    );
  }

  // Check if payment is approved before allowing consultation
  if (paymentStatus && !paymentStatus.consultationAvailable) {
    return (
      <div className="video-room-blocked">
        <h2>Consultation Not Available</h2>
        <p>
          Your payment has not been approved yet by the admin. 
          Please wait for the admin to approve your payment before starting the consultation.
        </p>
        <p>
          <strong>Payment Status:</strong> {paymentStatus.status}
          <br />
          <strong>Admin Status:</strong> {paymentStatus.adminStatus}
        </p>
        <button onClick={() => navigate("/patient/appointments")}>
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="video-room-page">
      <VideoConsultationRoom 
        appointmentId={appointmentId}
        userName={user?.name || "Patient"}
        userRole={user?.role || "patient"}
      />
    </div>
  );
}

export default VideoRoomPage;
