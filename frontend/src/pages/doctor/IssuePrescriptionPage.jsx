import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, AlertCircle, FileText, Plus, Trash2, Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import {
  createPrescription,
  getPrescriptions,
} from "../../api/doctorApi";
import apiClient from "../../services/apiClient";

function IssuePrescriptionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    diagnosis: "",
    symptoms: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    testsToBeDone: [{ name: "", description: "" }],
    followUpDate: "",
    warningsAndSideEffects: "",
    allergies: "",
    notes: "",
    validityPeriod: "10 days",
  });

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const response = await apiClient.get("/api/appointments/doctor/my");
        const appointments = response.data?.data?.appointments || [];
        
        const patientData = appointments.find((apt) => apt.patientId === patientId);
        if (patientData) {
          const patientInfo = {
            patientId: patientData.patientId,
            patientName: patientData.patientDetails?.fullName || "Unknown",
            phone: patientData.patientDetails?.phone || "-",
          };
          setPatient(patientInfo);
          
          setFormData((prev) => ({
            ...prev,
            patientName: patientInfo.patientName,
            patientPhone: patientInfo.phone,
          }));
        }
      } catch (err) {
        console.error("Error loading patient:", err);
        setError("Failed to load patient information");
      }
    };

    const loadPrescriptions = async () => {
      try {
        const response = await getPrescriptions();
        const allPrescriptions = response.data?.prescriptions || [];
        const patientPrescriptions = allPrescriptions.filter(
          (p) => p.patientName?.toLowerCase() === formData.patientName.toLowerCase()
        );
        setPrescriptions(patientPrescriptions);
      } catch (err) {
        console.error("Error loading prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
    loadPrescriptions();
  }, [patientId, formData.patientName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleTestChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      testsToBeDone: prev.testsToBeDone.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    }));
  };

  const addTest = () => {
    setFormData((prev) => ({
      ...prev,
      testsToBeDone: [...prev.testsToBeDone, { name: "", description: "" }],
    }));
  };

  const removeMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const removeTest = (index) => {
    setFormData((prev) => ({
      ...prev,
      testsToBeDone: prev.testsToBeDone.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim()) {
      setError("Clinical diagnosis is required");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const cleanedMedicines = formData.medicines.filter(
        (item) => item.name.trim() && item.dosage.trim()
      );

      if (cleanedMedicines.length === 0) {
        setError("At least one medication must be prescribed");
        setSaving(false);
        return;
      }

      const cleanedTests = formData.testsToBeDone.filter(
        (item) => item.name.trim()
      );

      const payload = {
        patientName: formData.patientName,
        patientAge: formData.patientAge ? Number(formData.patientAge) : null,
        patientPhone: formData.patientPhone,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        medicines: cleanedMedicines,
        testsToBeDone: cleanedTests,
        followUpDate: formData.followUpDate || null,
        warningsAndSideEffects: formData.warningsAndSideEffects,
        allergies: formData.allergies,
        notes: formData.notes,
        validityPeriod: formData.validityPeriod,
      };

      const response = await createPrescription(payload);
      setMessage("Prescription issued successfully!");

      // Reset form
      setFormData({
        patientName: patient?.patientName || "",
        patientAge: "",
        patientPhone: patient?.phone || "",
        diagnosis: "",
        symptoms: "",
        medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
        testsToBeDone: [{ name: "", description: "" }],
        followUpDate: "",
        warningsAndSideEffects: "",
        allergies: "",
        notes: "",
        validityPeriod: "10 days",
      });

      // Reload prescriptions
      const response2 = await getPrescriptions();
      const patientPrescriptions = (response2.data?.prescriptions || []).filter(
        (p) => p.patientName?.toLowerCase() === formData.patientName.toLowerCase()
      );
      setPrescriptions(patientPrescriptions);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue prescription. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const generatePrescriptionPDF = (prescription) => {
    const dateStr = prescription.issuedAt
      ? new Date(prescription.issuedAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Times New Roman', Georgia, serif; 
            padding: 50px; 
            max-width: 900px; 
            margin: 0 auto;
            background: white;
          }
          .prescription-header {
            border-bottom: 3px solid #1a472a;
            padding-bottom: 25px;
            margin-bottom: 35px;
            text-align: center;
          }
          .prescription-title {
            font-size: 36px;
            color: #1a472a;
            letter-spacing: 3px;
            font-weight: normal;
          }
          .doctor-details {
            margin-top: 15px;
            font-size: 14px;
            color: #4a5568;
          }
          .patient-section {
            background: #f7fafc;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #1a472a;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1a472a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .diagnosis-box {
            background: #fffaf0;
            padding: 15px;
            border-left: 4px solid #ed8936;
            margin-bottom: 25px;
          }
          .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .medication-table th {
            background: #f7fafc;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #cbd5e0;
          }
          .medication-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }
          .warning-box {
            background: #fff5f5;
            border: 2px solid #fc8181;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 5px;
          }
          .footer-note {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="prescription-header">
          <h1 class="prescription-title">MEDICAL PRESCRIPTION</h1>
          <div class="doctor-details">
            <strong>${prescription.doctorName || "Attending Physician"}</strong><br/>
            ${prescription.specialization ? `${prescription.specialization}<br/>` : ""}
            <span>Date Issued: ${dateStr}</span>
          </div>
        </div>

        <div class="patient-section">
          <h2 class="section-title">Patient Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px;"><strong>Name:</strong> ${prescription.patientName}</td>
              <td style="padding: 5px;"><strong>Age:</strong> ${prescription.patientAge ? prescription.patientAge + " years" : "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Contact:</strong> ${prescription.patientPhone || "Not provided"}</td>
              <td style="padding: 5px;"><strong>Allergies:</strong> ${prescription.allergies || "None reported"}</td>
            </tr>
          </table>
        </div>

        ${prescription.symptoms ? `
        <div style="margin-bottom: 25px;">
          <h2 class="section-title">Presenting Symptoms</h2>
          <p style="line-height: 1.6;">${prescription.symptoms}</p>
        </div>
        ` : ""}

        <div class="diagnosis-box">
          <h2 class="section-title">Clinical Diagnosis</h2>
          <p style="font-weight: bold;">${prescription.diagnosis}</p>
        </div>

        ${prescription.medicines && prescription.medicines.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 class="section-title">Prescribed Medications</h2>
          <table class="medication-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medicines.map((med) => `
              <tr>
                <td><strong>${med.name}</strong>${med.instructions ? `<br/><small style="color: #718096;">${med.instructions}</small>` : ""}</td>
                <td>${med.dosage}</td>
                <td>${med.frequency || "As directed"}</td>
                <td>${med.duration || "As directed"}</td>
              </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${prescription.testsToBeDone && prescription.testsToBeDone.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 class="section-title">Recommended Investigations</h2>
          <ul style="margin-left: 30px; line-height: 1.8;">
            ${prescription.testsToBeDone.map((test) => `
            <li><strong>${test.name}</strong>${test.description ? `<br/><small>${test.description}</small>` : ""}</li>
            `).join("")}
          </ul>
        </div>
        ` : ""}

        ${prescription.followUpDate ? `
        <div style="margin-bottom: 25px; background: #f0fff4; padding: 15px; border-left: 4px solid #38a169;">
          <h2 class="section-title">Follow-up Schedule</h2>
          <p><strong>Next Appointment:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</p>
          ${prescription.validityPeriod ? `<p><strong>Prescription Validity:</strong> ${prescription.validityPeriod}</p>` : ""}
        </div>
        ` : ""}

        ${prescription.warningsAndSideEffects ? `
        <div class="warning-box">
          <h2 class="section-title" style="color: #c53030;">⚠ Important Warnings</h2>
          <p style="color: #742a2a;">${prescription.warningsAndSideEffects}</p>
        </div>
        ` : ""}

        ${prescription.notes ? `
        <div style="margin-bottom: 25px;">
          <h2 class="section-title">Additional Instructions</h2>
          <p style="font-style: italic;">${prescription.notes}</p>
        </div>
        ` : ""}

        <div class="footer-note">
          <p>This is a legally valid electronic prescription issued by a registered medical practitioner.</p>
          <p style="margin-top: 5px;">Please consult your healthcare provider for any clarifications.</p>
        </div>
      </body>
      </html>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `Prescription_${prescription.patientName}_${dateStr.replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/doctor/prescriptions")}
              className="p-2 rounded-lg bg-white border border-cyan-200 hover:bg-cyan-50 transition"
              title="Back to prescriptions"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Issue Electronic Prescription
              </h1>
              <p className="text-slate-600 mt-1">
                {patient ? `Patient: ${patient.patientName}` : "Loading patient information..."}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div className="font-semibold">HIPAA Compliant</div>
            <div className="text-xs">Licensed Medical Platform</div>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-emerald-900">{message}</div>
              <div className="text-sm text-emerald-700 mt-1">The prescription has been successfully recorded in the patient's medical record.</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">{error}</div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-sky-700 px-6 py-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Pill size={24} />
                Prescription Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Patient Info Section */}
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4 border border-cyan-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Patient Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Age *</label>
                    <input
                      type="number"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder="Years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder="Known allergies..."
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Clinical Information</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                    placeholder="Patient-reported symptoms..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Diagnosis *</label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                    placeholder="Enter the primary clinical diagnosis..."
                  />
                </div>
              </div>

              {/* Medications Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Prescribed Medications *</h3>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="inline-flex items-center gap-1 text-sm bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-lg hover:bg-cyan-200 transition font-medium"
                  >
                    <Plus size={16} /> Add Medication
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.medicines.map((med, index) => (
                    <div key={index} className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <div className="grid gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-cyan-600 mb-1">Medication Name</label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Instructions</label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                            placeholder="e.g., With food"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Medication
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recommended Tests</h3>
                  <button
                    type="button"
                    onClick={addTest}
                    className="inline-flex items-center gap-1 text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition font-medium"
                  >
                    <Plus size={16} /> Add Test
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.testsToBeDone.map((test, index) => (
                    <div key={index} className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => handleTestChange(index, "name", e.target.value)}
                        className="w-full rounded border border-sky-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500 mb-2"
                        placeholder="Test name (e.g., Blood Test)"
                      />
                      <input
                        type="text"
                        value={test.description}
                        onChange={(e) => handleTestChange(index, "description", e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500 mb-2"
                        placeholder="Details (optional)"
                      />
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Section */}
              <div className="border-t border-slate-200 pt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prescription Validity</label>
                  <select
                    name="validityPeriod"
                    value={formData.validityPeriod}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  >
                    <option value="7 days">7 days</option>
                    <option value="10 days">10 days</option>
                    <option value="15 days">15 days</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                  </select>
                </div>
              </div>

              {/* Warnings & Notes */}
              <div className="border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Warnings & Precautions</label>
                  <textarea
                    name="warningsAndSideEffects"
                    value={formData.warningsAndSideEffects}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                    placeholder="Important warnings, side effects, or precautions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                    placeholder="Any supplementary clinical information..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-6 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-cyan-600 to-sky-700 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg"
                >
                  {saving ? "Processing..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - Prescription History */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-fit sticky top-6">
            <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-cyan-200 px-6 py-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full text-left font-semibold text-slate-900 flex items-center justify-between hover:text-cyan-600 transition"
              >
                <span>Prescription History</span>
                <span className="text-sm bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{prescriptions.length}</span>
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prescriptions.map((item) => (
                    <div key={item._id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.diagnosis}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(item.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => generatePrescriptionPDF(item)}
                          className="p-1.5 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 transition flex-shrink-0"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                      {item.medicines && item.medicines.length > 0 && (
                        <p className="text-xs text-slate-600">
                          💊 {item.medicines.length} medication{item.medicines.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500 text-sm">
                  No prescriptions issued yet for this patient
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssuePrescriptionPage;
