import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <h4 className="footer-title">MediConnect</h4>
            <p className="footer-description">
              Making healthcare accessible and affordable for everyone through
              innovative digital solutions.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">𝕏</a>
              <a href="#" className="social-link">in</a>
            </div>
          </div>

          {/* For Patients */}
          <div className="footer-section">
            <h5 className="footer-subtitle">For Patients</h5>
            <ul className="footer-links">
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/symptoms">Symptom Checker</Link></li>
              <li><a href="#health-records">Health Records</a></li>
              <li><a href="#appointments">My Appointments</a></li>
              <li><a href="#prescriptions">Prescriptions</a></li>
            </ul>
          </div>

          {/* For Doctors */}
          <div className="footer-section">
            <h5 className="footer-subtitle">For Doctors</h5>
            <ul className="footer-links">
              <li><a href="#join">Join Us</a></li>
              <li><a href="#verify">Verification</a></li>
              <li><a href="#tools">Practice Tools</a></li>
              <li><a href="#analytics">Analytics</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h5 className="footer-subtitle">Company</h5>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#press">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h5 className="footer-subtitle">Legal</h5>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#hipaa">HIPAA Compliance</a></li>
              <li><a href="#disclaimer">Medical Disclaimer</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 MediConnect. All rights reserved. | Built with ❤️ for better healthcare.
          </p>
          <div className="footer-badges">
            <span className="badge-text">🔒 HIPAA Compliant</span>
            <span className="badge-text">✅ ISO Certified</span>
            <span className="badge-text">🛡️ End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
