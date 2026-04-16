import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import "./ConsultationPage.css";

const ConsultationPage = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [videoStarted, setVideoStarted] = useState(false);


useEffect(() => {
    fetchConsultation();
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const response = await apiClient.get(
        `/api/consultations/${consultationId}`
      );
      setConsultation(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch consultation");
      setLoading(false);
    }
  };

  const startConsultation = async () => {
    try {
      const response = await apiClient.post(
        `/api/consultations/${consultationId}/start`,
        {}
      );
      setConsultation(response.data.data.consultation);
      setVideoStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start consultation");
    }
  };

  const endConsultation = async () => {
    try {
      await apiClient.post(
        `/api/consultations/${consultationId}/end`,
        {}
      );
      alert("Consultation ended");
      navigate("/appointments");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end consultation");
    }
  };

  const saveNotes = async () => {
    try {
      const response = await apiClient.put(
        `/api/consultations/${consultationId}/notes`,
        { notes, prescription }
      );
      setConsultation(response.data.data);
      alert("Notes and prescription saved successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save notes");
    }
  };

  if (loading) return <div className="consultation-loading">Loading...</div>;

  return (
    <div className="consultation-page">
      <div className="consultation-container">
        <h1>Consultation</h1>

        {error && <div className="error-alert">{error}</div>}

        <div className="consultation-header">
          <div className="consultation-info">
            <p>
              <strong>Status:</strong> {consultation?.status}
            </p>
            <p>
              <strong>Doctor ID:</strong> {consultation?.doctorId}
            </p>
            <p>
              <strong>Patient ID:</strong> {consultation?.patientId}
            </p>
          </div>
        </div>

        {consultation?.status === "pending" && (
          <button onClick={startConsultation} className="btn btn-primary">
            Start Consultation
          </button>
        )}

        {videoStarted && consultation?.videoLink && (
          <div className="video-section">
            <h2>Video Consultation</h2>
            <p>Meeting Link: {consultation.videoLink}</p>
            <a
              href={consultation.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Join Video Call
            </a>
          </div>
        )}

        {consultation?.status === "active" && (
          <div className="notes-section">
            <h2>Consultation Notes & Prescription</h2>
            <textarea
              placeholder="Add notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
            />
            <textarea
              placeholder="Add prescription here..."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows="4"
            />
            <button onClick={saveNotes} className="btn btn-secondary">
              Save Notes & Prescription
            </button>
            <button onClick={endConsultation} className="btn btn-danger">
              End Consultation
            </button>
          </div>
        )}

        {consultation?.status === "completed" && (
          <div className="completed-section">
            <h2>Consultation Completed</h2>
            <p>
              <strong>Notes:</strong> {consultation?.notes || "No notes added"}
            </p>
            <p>
              <strong>Prescription:</strong>{" "}
              {consultation?.prescription || "No prescription added"}
            </p>
            <button onClick={() => navigate("/appointments")} className="btn btn-primary">
              Back to Appointments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationPage;
