# Component Architecture Guide

## 🎯 Common Component Patterns

### 1. API Data Fetching Pattern

```jsx
import { useEffect, useState } from "react";

function DoctorListPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/doctors`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div>
      {doctors.map(doctor => (
        <DoctorCard key={doctor._id} doctor={doctor} />
      ))}
    </div>
  );
}
```

### 2. Form Handling Pattern

```jsx
import { useState } from "react";

function AppointmentForm() {
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to book appointment");
      
      const data = await response.json();
      // Handle success
      navigate("/patient/appointments");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Doctor</label>
        <select
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          required
        >
          <option value="">Select a doctor</option>
          {/* Options */}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
}

export default AppointmentForm;
```

### 3. Table Display Pattern

```jsx
function AppointmentTable({ appointments }) {
  return (
    <div className="table-container">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment._id}>
              <td>{appointment.doctorName}</td>
              <td>{new Date(appointment.date).toLocaleString()}</td>
              <td>
                <span className={`badge badge-${appointment.status}`}>
                  {appointment.status}
                </span>
              </td>
              <td>
                <button onClick={() => handleView(appointment._id)}>View</button>
                <button onClick={() => handleEdit(appointment._id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentTable;
```

### 4. Card Component Pattern

```jsx
function DoctorCard({ doctor, onBook }) {
  return (
    <div className="doctor-card">
      <img src={doctor.profileImage} alt={doctor.name} />
      
      <div className="card-content">
        <h3>{doctor.name}</h3>
        <p className="specialty">{doctor.specialty}</p>
        
        <div className="rating">
          <span className="stars">★★★★★</span>
          <span className="count">({doctor.reviewCount})</span>
        </div>

        <p className="bio">{doctor.bio}</p>

        <div className="info">
          <span>💰 {doctor.consultationFee}</span>
          <span>✓ {doctor.experience} years</span>
        </div>

        <button className="btn-book" onClick={() => onBook(doctor._id)}>
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default DoctorCard;
```

## 🔒 Authentication Pattern

### Using useAuth Hook

```jsx
import { useAuth } from "../../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ProfilePage;
```

## 🎨 Styling Pattern

### CSS Structure

```css
/* Page-level styles */
.appointment-page {
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Section styles */
.appointment-page .header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.appointment-page .header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

/* Component styles */
.appointment-page .card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .appointment-page {
    padding: 20px 10px;
  }

  .appointment-page .header h1 {
    font-size: 1.5rem;
  }
}
```

## 📋 Reusable Components

### LoadingSpinner

```jsx
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
```

### ErrorAlert

```jsx
function ErrorAlert({ message, onClose }) {
  return (
    <div className="error-alert">
      <span>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}

export default ErrorAlert;
```

### SuccessAlert

```jsx
function SuccessAlert({ message, onClose }) {
  return (
    <div className="success-alert">
      <span>✓ {message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}

export default SuccessAlert;
```

### Modal Dialog

```jsx
function Modal({ title, children, onClose, onConfirm, confirmText = "Confirm" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
```

## 🔌 API Service Pattern

### Creating a New Service

```javascript
// services/myFeatureApi.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/my-feature`;

export const getItems = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, {
      params: filters,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateItem = async (itemId, updates) => {
  try {
    const response = await axios.put(`${API_URL}/${itemId}`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await axios.delete(`${API_URL}/${itemId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

## 🎯 Best Practices

1. **Always handle loading states** - Show loading spinner while fetching
2. **Always show error messages** - Display user-friendly error alerts
3. **Use proper error boundaries** - Catch and display errors gracefully
4. **Validate forms** - Check required fields before submission
5. **Use TypeScript** - Consider migrating to TypeScript for type safety
6. **Lazy load components** - Use React.lazy for code splitting
7. **Memoize expensive computations** - Use useMemo for optimization
8. **Debounce API calls** - Avoid unnecessary requests during user input
9. **Consistent naming** - Follow naming conventions (camelCase for variables)
10. **DRY principle** - Create reusable components and functions

## 📱 Mobile Optimization

1. Touch-friendly buttons (min 44px height)
2. Responsive grid layouts
3. Mobile-first design approach
4. Proper viewport meta tag
5. Touch event handling for mobile interactions

## 🚀 Performance Tips

1. **Code Splitting**: Use lazy loading for routes
2. **Image Optimization**: Use proper image formats and sizes
3. **Caching**: Implement response caching strategies
4. **Bundle Size**: Monitor and optimize bundle size
5. **Network Requests**: Minimize API calls with proper pagination

---

Use these patterns and components as templates when building new features!
