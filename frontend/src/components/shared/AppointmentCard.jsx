import "./AppointmentCard.css";

function AppointmentCard({ appointment, showActions = true }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
      case "confirmed":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "completed":
        return "badge-neutral";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-primary";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-doctor">
          <div className="doctor-avatar-mini">
            {appointment.doctorAvatar ? (
              <img src={appointment.doctorAvatar} alt={appointment.doctorName} />
            ) : (
              <div className="avatar-placeholder-mini">
                {appointment.doctorName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="doctor-details">
            <h4 className="doctor-name-mini">{appointment.doctorName}</h4>
            <p className="doctor-specialty-mini">{appointment.specialty}</p>
          </div>
        </div>
        <span className={`badge ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <span className="detail-label">📅 Date & Time</span>
          <span className="detail-value">
            {formatDate(appointment.date)} at {formatTime(appointment.time)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">🏥 Consultation Type</span>
          <span className="detail-value">
            {appointment.consultationType || "Video Call"}
          </span>
        </div>

        {appointment.notes && (
          <div className="detail-row">
            <span className="detail-label">📝 Notes</span>
            <span className="detail-value">{appointment.notes}</span>
          </div>
        )}

        {appointment.fee && (
          <div className="detail-row">
            <span className="detail-label">💰 Fee</span>
            <span className="detail-value">₹{appointment.fee}</span>
          </div>
        )}
      </div>

      {showActions && appointment.status === "scheduled" && (
        <div className="appointment-actions">
          <button className="btn btn-sm btn-outline">Reschedule</button>
          <button className="btn btn-sm btn-danger">Cancel</button>
        </div>
      )}

      {showActions && appointment.status === "completed" && (
        <div className="appointment-actions">
          <button className="btn btn-sm btn-primary">Leave Review</button>
        </div>
      )}
    </div>
  );
}

export default AppointmentCard;
