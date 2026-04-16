import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import "./AppointmentHistoryPage.css";

function AppointmentHistoryPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments?status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "scheduled":
        return "status-scheduled";
      case "pending":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <div className="appointment-history-page">
      <div className="header">
        <h1>Appointment History</h1>
        <p>View all your appointments and consultations</p>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Appointments
        </button>
        <button
          className={`filter-btn ${filter === "scheduled" ? "active" : ""}`}
          onClick={() => setFilter("scheduled")}
        >
          Upcoming
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.doctorName}</h3>
                <span className={`status ${getStatusColor(appointment.status)}`}>
                  {appointment.status.toUpperCase()}
                </span>
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <span className="label">Date & Time:</span>
                  <span className="value">
                    {new Date(appointment.appointmentDate).toLocaleString()}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Specialty:</span>
                  <span className="value">{appointment.specialty}</span>
                </div>

                {appointment.reason && (
                  <div className="detail-row">
                    <span className="label">Reason:</span>
                    <span className="value">{appointment.reason}</span>
                  </div>
                )}

                {appointment.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{appointment.notes}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status === "scheduled" && (
                  <>
                    <button className="btn-action btn-reschedule">
                      Reschedule
                    </button>
                    <button className="btn-action btn-cancel">Cancel</button>
                  </>
                )}
                {appointment.status === "completed" && (
                  <button className="btn-action btn-review">Leave Review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentHistoryPage;
