import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, FileText, Save, X } from "lucide-react";
import {
  fetchPatientReports,
  uploadPatientReport,
  updatePatientReport,
  replacePatientReportFile,
  deletePatientReport,
} from "../../services/patientService";
import ReportUploadForm from "../../components/patient/ReportUploadForm";
import ReportCard from "../../components/patient/ReportCard";

const emptyUploadForm = {
  title: "",
  reportType: "",
  description: "",
  reportFile: null,
};

const emptyEditForm = {
  title: "",
  reportType: "",
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editing, setEditing] = useState(false);

  const [replacingId, setReplacingId] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacing, setReplacing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadReports = async () => {
    try {
      const response = await fetchPatientReports();
      setReports(response.data.reports || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Upload handlers
  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "reportFile") {
      setUploadForm((prev) => ({ ...prev, reportFile: files[0] || null }));
      return;
    }
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetUploadForm = () => {
    setUploadForm(emptyUploadForm);
    const fileInput = document.getElementById("reportFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("reportType", uploadForm.reportType);
      formData.append("description", uploadForm.description);
      formData.append("reportFile", uploadForm.reportFile);

      const response = await uploadPatientReport(formData);
      setSuccessMessage(response.message || "Report uploaded successfully");
      resetUploadForm();
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  // Edit handlers
  const handleStartEdit = (report) => {
    setEditingId(report._id);
    setEditForm({
      title: report.title || "",
      reportType: report.reportType || "",
      description: report.description || "",
    });
    setSuccessMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await updatePatientReport(editingId, editForm);
      setSuccessMessage(response.message || "Report details updated successfully");
      handleCancelEdit();
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to update report details");
    } finally {
      setEditing(false);
    }
  };

  // Replace handlers
  const handleStartReplace = (id) => {
    setReplacingId(id);
    setReplacementFile(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCancelReplace = () => {
    setReplacingId(null);
    setReplacementFile(null);
  };

  const handleReplacementFileChange = (e) => {
    setReplacementFile(e.target.files?.[0] || null);
  };

  const handleConfirmReplace = async (id) => {
    if (!replacementFile) {
      setErrorMessage("Please choose a new file to replace.");
      return;
    }
    setReplacing(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("reportFile", replacementFile);
      const response = await replacePatientReportFile(id, formData);
      setSuccessMessage(response.message || "Report file replaced successfully");
      handleCancelReplace();
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to replace report file");
    } finally {
      setReplacing(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this report?");
    if (!confirmed) return;

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await deletePatientReport(id);
      setSuccessMessage(response.message || "Report deleted successfully");
      if (editingId === id) handleCancelEdit();
      if (replacingId === id) handleCancelReplace();
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete report");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload, update, replace, and manage your medical reports.
        </p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Upload form */}
      <ReportUploadForm
        form={uploadForm}
        uploading={uploading}
        onChange={handleUploadChange}
        onSubmit={handleUploadSubmit}
      />

      {/* Edit form — shown at top when editing a report */}
      {editingId && (
        <form
          onSubmit={handleEditSubmit}
          className="rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Edit Report Details</h2>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Report Title <span className="text-red-400">*</span>
              </label>
              <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className={inputClass} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Report Type</label>
              <input type="text" name="reportType" value={editForm.reportType} onChange={handleEditChange} className={inputClass} />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" className={inputClass} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={editing}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {editing ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={editing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reports list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">My Reports</h2>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No reports uploaded yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              Use the form above to upload your first report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                replacingId={replacingId}
                replacing={replacing}
                replacementFile={replacementFile}
                onStartEdit={handleStartEdit}
                onStartReplace={handleStartReplace}
                onCancelReplace={handleCancelReplace}
                onReplacementFileChange={handleReplacementFileChange}
                onConfirmReplace={handleConfirmReplace}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;