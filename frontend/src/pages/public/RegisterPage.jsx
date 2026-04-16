import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerDoctor, registerPatient } from "../../services/authApi";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      const response =
        formData.role === "doctor"
          ? await registerDoctor(payload)
          : await registerPatient(payload);

      setSuccessMessage(response.message || "Registration successful! Redirecting to OTP verification...");

      setTimeout(() => {
        navigate("/verify-otp", {
          state: { email: formData.email },
        });
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Illustration */}
        <div className="register-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">👥</div>
            <h2>Join MediConnect</h2>
            <p>Get access to quality healthcare services</p>
            <div className="illustration-benefits">
              <div className="benefit">
                <span className="benefit-icon">🏥</span>
                <span>Connect with Doctors</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📋</span>
                <span>Manage Health Records</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💊</span>
                <span>Get Prescriptions Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="register-form-wrapper">
          <div className="register-form-container">
            <div className="form-header">
              <h1 className="text-h2">Create Account</h1>
              <p className="text-body-md">Register as a patient or doctor to get started</p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <p className="alert-title">Registration Error</p>
                  <p className="alert-message">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                <div className="alert-content">
                  <p className="alert-title">Success</p>
                  <p className="alert-message">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Role Selection */}
              <div className="role-selector">
                <label className="input-label">Select Your Role</label>
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="patient"
                      checked={formData.role === "patient"}
                      onChange={handleChange}
                    />
                    <div className="role-card patient-role">
                      <span className="role-icon">🙋‍♂️</span>
                      <span className="role-text">Patient</span>
                      <span className="role-desc">Book appointments, get care</span>
                    </div>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="doctor"
                      checked={formData.role === "doctor"}
                      onChange={handleChange}
                    />
                    <div className="role-card doctor-role">
                      <span className="role-icon">👨‍⚕️</span>
                      <span className="role-text">Doctor</span>
                      <span className="role-desc">Provide healthcare services</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="form-group">
                <label className="input-label">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Password *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="input-field"
                  required
                />
                <p className="field-hint">Minimum 8 characters with uppercase, numbers, and symbols</p>
              </div>

              <div className="form-agree">
                <input type="checkbox" id="agree" required />
                <label htmlFor="agree">
                  I agree to the <a href="#terms" className="footer-link">Terms of Service</a> and{" "}
                  <a href="#privacy" className="footer-link">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary btn-lg w-full ${loading ? "is-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="form-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="btn btn-outline btn-lg w-full">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;