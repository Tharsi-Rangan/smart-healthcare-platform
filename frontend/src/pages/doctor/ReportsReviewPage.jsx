import { useEffect, useState } from "react";
import {
  createPatientReport,
  getPatientReportById,
  getPatientReports,
} from "../../api/doctorApi";

function ReportsReviewPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    bloodType: "",
    allergies: "",
    reports: [
      {
        title: "",
        type: "",
        fileUrl: "",
        reportDate: "",
        size: "",
      },
    ],
    medicalHistory: [
      {
        condition: "",
        description: "",
        diagnosedYear: "",
      },
    ],
  });

  const loadReports = async () => {
    try {
      setError("");
      const response = await getPatientReports();
      setReports(response.data?.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patient reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

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
        {
          title: "",
          type: "",
          fileUrl: "",
          reportDate: "",
          size: "",
        },
      ],
    }));
  };

  const addHistoryRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: [
        ...prev.medicalHistory,
        {
          condition: "",
          description: "",
          diagnosedYear: "",
        },
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

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const cleanedReports = formData.reports.filter((item) => item.title.trim());
      const cleanedHistory = formData.medicalHistory.filter((item) =>
        item.condition.trim()
      );

      const payload = {
        ...formData,
        reports: cleanedReports,
        medicalHistory: cleanedHistory,
      };

      const response = await createPatientReport(payload);
      setMessage(response.message || "Patient report created successfully");

      setFormData({
        patientName: "",
        patientAge: "",
        bloodType: "",
        allergies: "",
        reports: [
          {
            title: "",
            type: "",
            fileUrl: "",
            reportDate: "",
            size: "",
          },
        ],
        medicalHistory: [
          {
            condition: "",
            description: "",
            diagnosedYear: "",
          },
        ],
      });

      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create patient report");
    } finally {
      setSaving(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      setError("");
      const response = await getPatientReportById(reportId);
      setSelectedReport(response.data?.report || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report details");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">Patient Medical Reports</h1>
        <p className="mt-3 text-2xl text-slate-500">
          Create and review patient medical reports
        </p>
      </div>

      {message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-lg text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr,1fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-4xl font-semibold text-slate-900">
            Create Patient Report
          </h2>

          <form onSubmit={handleCreateReport} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-xl text-slate-500">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-3 block text-xl text-slate-500">
                  Patient Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                  placeholder="35"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-xl text-slate-500">
                  Blood Type
                </label>
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                  placeholder="O+"
                />
              </div>

              <div>
                <label className="mb-3 block text-xl text-slate-500">
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                  placeholder="Penicillin"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-slate-900">Reports</h3>
                <button
                  type="button"
                  onClick={addReportRow}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-xl font-medium text-slate-900"
                >
                  Add Report
                </button>
              </div>

              {formData.reports.map((item, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-[24px] border border-slate-200 p-5"
                >
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleReportFieldChange(index, "title", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                    placeholder="ECG Report.pdf"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={item.type}
                      onChange={(e) =>
                        handleReportFieldChange(index, "type", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                      placeholder="Diagnostic"
                    />

                    <input
                      type="text"
                      value={item.reportDate}
                      onChange={(e) =>
                        handleReportFieldChange(index, "reportDate", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                      placeholder="2026-03-28"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) =>
                        handleReportFieldChange(index, "size", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                      placeholder="180 KB"
                    />

                    <input
                      type="text"
                      value={item.fileUrl}
                      onChange={(e) =>
                        handleReportFieldChange(index, "fileUrl", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                      placeholder="File URL (optional)"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeReportRow(index)}
                    className="rounded-2xl bg-rose-50 px-4 py-3 text-xl font-medium text-red-500"
                  >
                    Remove Report
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-slate-900">
                  Medical History
                </h3>
                <button
                  type="button"
                  onClick={addHistoryRow}
                  className="rounded-2xl bg-slate-100 px-5 py-3 text-xl font-medium text-slate-900"
                >
                  Add History
                </button>
              </div>

              {formData.medicalHistory.map((item, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-[24px] border border-slate-200 p-5"
                >
                  <input
                    type="text"
                    value={item.condition}
                    onChange={(e) =>
                      handleHistoryFieldChange(index, "condition", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                    placeholder="Hypertension"
                  />

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleHistoryFieldChange(index, "description", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                    placeholder="Currently on medication"
                  />

                  <input
                    type="text"
                    value={item.diagnosedYear}
                    onChange={(e) =>
                      handleHistoryFieldChange(index, "diagnosedYear", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xl outline-none"
                    placeholder="2020"
                  />

                  <button
                    type="button"
                    onClick={() => removeHistoryRow(index)}
                    className="rounded-2xl bg-rose-50 px-4 py-3 text-xl font-medium text-red-500"
                  >
                    Remove History
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-600 px-8 py-4 text-2xl font-semibold text-white disabled:opacity-70"
            >
              {saving ? "Saving..." : "Create Report"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-4xl font-semibold text-slate-900">
              Patient Reports
            </h2>

            {loading ? (
              <p className="mt-6 text-xl text-slate-500">Loading reports...</p>
            ) : reports.length > 0 ? (
              <div className="mt-6 space-y-5">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-[24px] border border-slate-200 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-3xl font-semibold text-slate-900">
                          {report.patientName}
                        </h3>
                        <p className="mt-2 text-xl text-slate-500">
                          Age: {report.patientAge || 0} • Blood Type: {report.bloodType || "-"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleViewReport(report._id)}
                        className="rounded-2xl bg-slate-100 px-5 py-3 text-xl font-medium text-slate-900"
                      >
                        View
                      </button>
                    </div>

                    <p className="mt-4 text-xl text-slate-500">
                      Allergies: {report.allergies || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-xl text-slate-500">No reports found.</p>
            )}
          </div>

          {selectedReport && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-4xl font-semibold text-slate-900">
                Selected Report
              </h2>

              <div className="space-y-5">
                <div>
                  <p className="text-xl text-slate-500">Patient</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedReport.patientName}
                  </p>
                </div>

                <div>
                  <p className="text-xl text-slate-500">Reports</p>
                  <div className="mt-3 space-y-3">
                    {selectedReport.reports?.length > 0 ? (
                      selectedReport.reports.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl bg-slate-50 px-5 py-4 text-xl"
                        >
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-slate-500">
                            {item.type} • {item.reportDate} • {item.size}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xl text-slate-500">No report files found.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xl text-slate-500">Medical History</p>
                  <div className="mt-3 space-y-3">
                    {selectedReport.medicalHistory?.length > 0 ? (
                      selectedReport.medicalHistory.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl bg-slate-50 px-5 py-4 text-xl"
                        >
                          <p className="font-semibold text-slate-900">
                            {item.condition}
                          </p>
                          <p className="mt-1 text-slate-500">
                            {item.description} • Diagnosed: {item.diagnosedYear}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xl text-slate-500">No medical history found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsReviewPage;