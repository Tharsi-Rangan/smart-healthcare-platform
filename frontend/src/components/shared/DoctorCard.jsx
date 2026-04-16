import { Link } from "react-router-dom";
import "./DoctorCard.css";

function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          {doctor.avatar ? (
            <img src={doctor.avatar} alt={doctor.name} />
          ) : (
            <div className="avatar-placeholder">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="doctor-verification">
          {doctor.verified && <span className="verified-badge">✓ Verified</span>}
        </div>
      </div>

      <div className="doctor-card-body">
        <h3 className="doctor-name">{doctor.name}</h3>
        <p className="doctor-specialty">{doctor.specialty}</p>

        <div className="doctor-info">
          <div className="info-item">
            <span className="info-label">Experience</span>
            <span className="info-value">{doctor.experience} yrs</span>
          </div>
          <div className="info-item">
            <span className="info-label">Rating</span>
            <span className="info-value">⭐ {doctor.rating || 4.5}/5</span>
          </div>
        </div>

        <div className="doctor-location">
          📍 {doctor.city || "Online"}
        </div>

        <div className="doctor-price">
          <span className="price-label">Consultation Fee</span>
          <span className="price-value">₹{doctor.consultationFee || 500}</span>
        </div>
      </div>

      <div className="doctor-card-footer">
        <Link
          to={`/doctors/${doctor.id}`}
          className="btn btn-sm btn-outline w-full"
        >
          View Profile
        </Link>
        <Link
          to={`/book-appointment?doctorId=${doctor.id}`}
          className="btn btn-sm btn-primary w-full"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}

export default DoctorCard;
