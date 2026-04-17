import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Pill,
} from "lucide-react";
import {
  createPatientReport,
  getPatientReportById,
  getPatientReports,
} from "../../api/doctorApi";
import apiClient from "../../services/apiClient";

function UpdateReportPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    bloodType: "",
    allergies: "",
    reports: [{ title: "", type: "", fileUrl: "", reportDate: "", size: "" }],
    medicalHistory: [{ condition: "", description: "", diagnosedYear: "" }],
  });

  // Load patient and report data
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Get patient from appointments
        const appointmentsResponse = await apiClient.get(
          "/api/appointments/doctor/my"
        );
        const appointments = appointmentsResponse.data?.data?.appointments || [];

        const patient = appointments.find(
          (apt) => apt.patientId === patientId
        );

        if (patient) {
          const patientData = {
            patientId: patient.patientId,
            patientName: patient.patientDetails?.fullName || "Unknown",
            phone: patient.patientDetails?.phone || "-",
          };
          setPatientInfo(patientData);

          // Load all reports
          try {
            const reportsResponse = await getPatientReports();
            const allReports = reportsResponse.data?.reports || [];
            setReports(allReports);

            // Find existing report for this patient
            const existingReport = allReports.find(
              (report) =>
                report.patientName?.toLowerCase() ===
                patientData.patientName.toLowerCase()
            );

            if (existingReport) {
              setSelectedReport(existingReport);
              setFormData({
                patientName: existingReport.patientName,
                patientAge: existingReport.patientAge || "",
                bloodType: existingReport.bloodType || "",
                allergies: existingReport.allergies || "",
                reports: existingReport.reports || [
                  { title: "", type: "", fileUrl: "", reportDate: "", size: "" },
                ],
                medicalHistory: existingReport.medicalHistory || [
                  { condition: "", description: "", diagnosedYear: "" },
                ],
              });
            } else {
              setFormData({
                patientName: patientData.patientName,
                patientAge: "",
                bloodType: "",
                allergies: "",
                reports: [
                  { title: "", type: "", fileUrl: "", reportDate: "", size: "" },
                ],
                medicalHistory: [
                  { condition: "", description: "", diagnosedYear: "" },
                ],
              });
            }
          } catch (err) {
            console.error("Error loading reports:", err);
            setFormData({
              patientName: patientData.patientName,
              patientAge: "",
              bloodType: "",
              allergies: "",
              reports: [
                { title: "", type: "", fileUrl: "", reportDate: "", size: "" },
              ],
              medicalHistory: [
                { condition: "", description: "", diagnosedYear: "" },
              ],
            });
          }
        } else {
          setError("Patient not found");
        }
      } catch (err) {
        console.error("Error loading patient data:", err);
        setError("Failed to load patient information");
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "patientAge" ? Number(value) : value,
    }));
  };

  const handleReportFieldChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      reports: prev.reports.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleHistoryFieldChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addReportRow = () => {
    setFormData((prev) => ({
      ...prev,
      reports: [
        ...prev.reports,
        { title: "", type: "", fileUrl: "", reportDate: "", size: "" },
      ],
    }));
  };

  const addHistoryRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: [
        ...prev.medicalHistory,
        { condition: "", description: "", diagnosedYear: "" },
      ],
    }));
  };

  const removeReportRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      reports: prev.reports.filter((_, i) => i !== index),
    }));
  };

  const removeHistoryRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientInfo) {
      setError("Patient information not available");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const cleanedReports = formData.reports.filter(
        (item) => item.title.trim()
      );
      const cleanedHistory = formData.medicalHistory.filter((item) =>
        item.condition.trim()
      );

      const payload = {
        patientName: formData.patientName,
        patientAge: formData.patientAge ? Number(formData.patientAge) : null,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        reports: cleanedReports,
        medicalHistory: cleanedHistory,
      };

      const response = await createPatientReport(payload);
      setMessage(response.message || "Patient report saved successfully");

      // Reload reports
      try {
        const reportsResponse = await getPatientReports();
        const allReports = reportsResponse.data?.reports || [];
        setReports(allReports);

        const updatedReport = allReports.find(
          (report) =>
            report.patientName?.toLowerCase() ===
            formData.patientName.toLowerCase()
        );

        if (updatedReport) {
          setSelectedReport(updatedReport);
        }
      } catch (err) {
        console.error("Error reloading reports:", err);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save patient report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/doctor/reports")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Patient Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              Unable to load patient information
            </p>
            <button
              onClick={() => navigate("/doctor/reports")}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Return to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/doctor/reports")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </button>

          <div className="bg-gradient-to-r from-cyan-600 to-sky-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Patient Medical Report</h1>
                <p className="text-cyan-100">
                  Create and manage medical records for {patientInfo.patientName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{patientInfo.patientName.split(" ")[0]}</div>
                <div className="text-cyan-100 text-sm">
                  📞 {patientInfo.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
            <span className="text-emerald-700">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-6 py-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User size={24} className="text-cyan-600" />
                Patient Medical Records
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 pb-3 border-b border-slate-200">
                  Basic Information
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Blood Type
                    </label>
                    <input
                      type="text"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder="O+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Allergies
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      placeholder="e.g., Penicillin, Nuts"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Reports Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    Medical Reports
                  </h3>
                  <button
                    type="button"
                    onClick={addReportRow}
                    className="flex items-center gap-1 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition font-medium text-sm"
                  >
                    <Plus size={16} />
                    Add Report
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.reports.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <div className="grid gap-4 mb-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleReportFieldChange(index, "title", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Report title (e.g., ECG Report)"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            value={item.type}
                            onChange={(e) =>
                              handleReportFieldChange(index, "type", e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Type (e.g., Diagnostic)"
                          />
                          <input
                            type="text"
                            value={item.reportDate}
                            onChange={(e) =>
                              handleReportFieldChange(index, "reportDate", e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Date (e.g., 2026-03-28)"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            value={item.size}
                            onChange={(e) =>
                              handleReportFieldChange(index, "size", e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="Size (e.g., 180 KB)"
                          />
                          <input
                            type="text"
                            value={item.fileUrl}
                            onChange={(e) =>
                              handleReportFieldChange(index, "fileUrl", e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            placeholder="File URL (optional)"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeReportRow(index)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    Medical History
                  </h3>
                  <button
                    type="button"
                    onClick={addHistoryRow}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
                  >
                    <Plus size={16} />
                    Add History
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.medicalHistory.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <div className="grid gap-4 mb-4">
                        <input
                          type="text"
                          value={item.condition}
                          onChange={(e) =>
                            handleHistoryFieldChange(
                              index,
                              "condition",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Condition (e.g., Hypertension)"
                        />

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleHistoryFieldChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Description (e.g., Currently on medication)"
                        />

                        <input
                          type="text"
                          value={item.diagnosedYear}
                          onChange={(e) =>
                            handleHistoryFieldChange(
                              index,
                              "diagnosedYear",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Year diagnosed (e.g., 2020)"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeHistoryRow(index)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate("/doctor/reports")}
                  className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-600 to-sky-700 text-white rounded-lg hover:from-cyan-700 hover:to-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {saving ? "Saving..." : "Save Medical Records"}
                </button>
              </div>
            </form>
          </div>

          {/* Report Display - 1 column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={20} className="text-cyan-600" />
                Current Records
              </h2>
            </div>

            <div className="p-6">
              {selectedReport ? (
                <div className="space-y-6">
                  {/* Patient Info Card */}
                  <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4">
                    <p className="text-xs font-bold text-cyan-900 uppercase mb-3">
                      Patient Info
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-slate-700">Name:</span>{" "}
                        <span className="text-slate-900">
                          {selectedReport.patientName}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Age:</span>{" "}
                        <span className="text-slate-900">
                          {selectedReport.patientAge || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Blood Type:
                        </span>{" "}
                        <span className="text-slate-900">
                          {selectedReport.bloodType || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Allergies:
                        </span>{" "}
                        <span className="text-slate-900">
                          {selectedReport.allergies || "None"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Reports */}
                  {selectedReport.reports && selectedReport.reports.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase mb-3">
                        Medical Reports
                      </p>
                      <div className="space-y-2">
                        {selectedReport.reports.map((report, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-blue-50 border border-blue-200 p-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {report.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              <span className="font-medium">Type:</span> {report.type} |{" "}
                              <span className="font-medium">Date:</span>{" "}
                              {report.reportDate}
                            </p>
                            <p className="text-xs text-slate-600">
                              <span className="font-medium">Size:</span> {report.size}
                            </p>
                            {report.fileUrl && (
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-600 hover:text-cyan-700 underline mt-2 block font-medium"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medical History */}
                  {selectedReport.medicalHistory &&
                    selectedReport.medicalHistory.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase mb-3">
                          Medical History
                        </p>
                        <div className="space-y-2">
                          {selectedReport.medicalHistory.map((history, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-amber-50 border border-amber-200 p-3"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {history.condition}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {history.description}
                              </p>
                              <p className="text-xs text-slate-600">
                                <span className="font-medium">Diagnosed:</span>{" "}
                                {history.diagnosedYear}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pill size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">
                    No records created yet
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Fill in the form to create medical records
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateReportPage;
