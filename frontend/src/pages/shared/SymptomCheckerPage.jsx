import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SymptomCheckerPage.css";

function SymptomCheckerPage() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/symptom-checker/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            symptoms,
            duration,
            severity,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze symptoms");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Error analyzing symptoms");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate("/book-appointment", {
      state: { suggestedSpecialty: results?.suggestedSpecialty },
    });
  };

  return (
    <div className="symptom-checker-page">
      <div className="container">
        <div className="header">
          <h1>Symptom Checker</h1>
          <p>Describe your symptoms to get personalized recommendations</p>
        </div>

        <div className="content">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="symptom-form">
              <div className="form-group">
                <label htmlFor="symptoms">Describe Your Symptoms *</label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., I have a headache and fever for 2 days..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="less-than-24h">Less than 24 hours</option>
                    <option value="1-3-days">1-3 days</option>
                    <option value="4-7-days">4-7 days</option>
                    <option value="more-than-week">More than a week</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="severity">Severity *</label>
                  <select
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? "Analyzing..." : "Analyze Symptoms"}
              </button>
            </form>
          </div>

          {results && (
            <div className="results-section">
              <div className="results-card">
                <h2>Analysis Results</h2>
                <div className="result-item">
                  <h3>Possible Conditions</h3>
                  <ul className="conditions-list">
                    {results.possibleConditions?.map((condition, idx) => (
                      <li key={idx}>
                        <span className="condition-name">{condition.name}</span>
                        <span className="condition-probability">
                          {condition.probability}% match
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="result-item">
                  <h3>Recommended Specialty</h3>
                  <p className="specialty">
                    {results.suggestedSpecialty || "General Practitioner"}
                  </p>
                </div>

                <div className="result-item">
                  <h3>Recommendations</h3>
                  <ul className="recommendations-list">
                    {results.recommendations?.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-item warning">
                  <p>
                    ⚠️ This is an AI-based preliminary assessment. Please
                    consult with a healthcare professional for accurate
                    diagnosis and treatment.
                  </p>
                </div>

                <button
                  onClick={handleBookAppointment}
                  className="btn-book-appointment"
                >
                  Book an Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SymptomCheckerPage;
