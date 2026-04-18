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

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const appointmentsResponse = await apiClient.get("/api/appointments/doctor/my");
        const appointments = appointmentsResponse.data?.data?.appointments || [];

        const patient = appointments.find((apt) => apt.patientId === patientId);

        if (patient) {
          const patientData = {
            patientId: patient.patientId,
            patientName: patient.patientDetails?.fullName || "Unknown",
            phone: patient.patientDetails?.phone || "-",
          };
          setPatientInfo(patientData);

          try {
            const reportsResponse = await getPatientReports();
            const allReports = reportsResponse.data?.reports || [];
            setReports(allReports);

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
                reports: [{ title: "", type: "", fileUrl: "", reportDate: "", size: "" }],
                medicalHistory: [{ condition: "", description: "", diagnosedYear: "" }],
              });
            }
          } catch {
            setFormData({
              patientName: patientData.patientName,
              patientAge: "",
              bloodType: "",
              allergies: "",
              reports: [{ title: "", type: "", fileUrl: "", reportDate: "", size: "" }],
              medicalHistory: [{ condition: "", description: "", diagnosedYear: "" }],
            });
          }
        } else {
          setError("Patient not found");
        }
      } catch {
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
      const cleanedReports = formData.reports.filter((item) => item.title.trim());
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
      } catch {
        // ignore reload failure
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save patient report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Loading patient information...</p>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/doctor/reports")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Reports
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertCircle size={44} className="mx-auto mb-4 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-900">Patient Not Found</h2>
          <p className="mt-2 text-slate-500">Unable to load patient information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/doctor/reports")}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Reports
      </button>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Patient Medical Record
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {patientInfo.patientName}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Create and manage medical records for this patient.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Contact
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {patientInfo.phone}
            </p>
          </div>
        </div>
      </section>

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <User size={20} className="text-cyan-700" />
              Patient Medical Records
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-bold uppercase text-slate-900">
                Basic Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Patient age"
                />
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Blood type"
                />
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Allergies"
                />
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold uppercase text-slate-900">
                  Medical Reports
                </h3>
                <button
                  type="button"
                  onClick={addReportRow}
                  className="inline-flex items-center gap-1 rounded-xl bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
                >
                  <Plus size={16} />
                  Add Report
                </button>
              </div>

              <div className="space-y-4">
                {formData.reports.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleReportFieldChange(index, "title", e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        placeholder="Report title"
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          type="text"
                          value={item.type}
                          onChange={(e) =>
                            handleReportFieldChange(index, "type", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                          placeholder="Type"
                        />
                        <input
                          type="text"
                          value={item.reportDate}
                          onChange={(e) =>
                            handleReportFieldChange(index, "reportDate", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                          placeholder="Report date"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            handleReportFieldChange(index, "size", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                          placeholder="Size"
                        />
                        <input
                          type="text"
                          value={item.fileUrl}
                          onChange={(e) =>
                            handleReportFieldChange(index, "fileUrl", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                          placeholder="File URL"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeReportRow(index)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold uppercase text-slate-900">
                  Medical History
                </h3>
                <button
                  type="button"
                  onClick={addHistoryRow}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <Plus size={16} />
                  Add History
                </button>
              </div>

              <div className="space-y-4">
                {formData.medicalHistory.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="grid gap-4">
                      <input
                        type="text"
                        value={item.condition}
                        onChange={(e) =>
                          handleHistoryFieldChange(index, "condition", e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        placeholder="Condition"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleHistoryFieldChange(index, "description", e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        placeholder="Description"
                      />
                      <input
                        type="text"
                        value={item.diagnosedYear}
                        onChange={(e) =>
                          handleHistoryFieldChange(index, "diagnosedYear", e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        placeholder="Diagnosed year"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHistoryRow(index)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => navigate("/doctor/reports")}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-cyan-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Medical Records"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Calendar size={20} className="text-cyan-700" />
            Current Records
          </h2>

          <div className="mt-6">
            {selectedReport ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                  <p className="text-xs font-bold uppercase text-cyan-900">
                    Patient Info
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-700">Name:</span> <span className="text-slate-900">{selectedReport.patientName}</span></p>
                    <p><span className="font-semibold text-slate-700">Age:</span> <span className="text-slate-900">{selectedReport.patientAge || "N/A"}</span></p>
                    <p><span className="font-semibold text-slate-700">Blood Type:</span> <span className="text-slate-900">{selectedReport.bloodType || "N/A"}</span></p>
                    <p><span className="font-semibold text-slate-700">Allergies:</span> <span className="text-slate-900">{selectedReport.allergies || "None"}</span></p>
                  </div>
                </div>

                {selectedReport.reports && selectedReport.reports.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase text-slate-900">
                      Medical Reports
                    </p>
                    <div className="space-y-2">
                      {selectedReport.reports.map((report, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-blue-200 bg-blue-50 p-3"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {report.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            <span className="font-medium">Type:</span> {report.type} |{" "}
                            <span className="font-medium">Date:</span> {report.reportDate}
                          </p>
                          <p className="text-xs text-slate-600">
                            <span className="font-medium">Size:</span> {report.size}
                          </p>
                          {report.fileUrl && (
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block text-xs font-medium text-cyan-700 underline"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.medicalHistory &&
                  selectedReport.medicalHistory.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase text-slate-900">
                        Medical History
                      </p>
                      <div className="space-y-2">
                        {selectedReport.medicalHistory.map((history, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-amber-200 bg-amber-50 p-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {history.condition}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
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
              <div className="py-12 text-center">
                <Pill size={44} className="mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-700">No records created yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the form to create medical records.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default UpdateReportPage;