import { useEffect, useState } from "react";
import {
  fetchPatientReports,
  uploadPatientReport,
  updatePatientReport,
  replacePatientReportFile,
  deletePatientReport,
} from "../../services/patientService";

const FILE_BASE_URL = "http://localhost:5002";

function ReportsPage() {
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

  const handleUploadChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "reportFile") {
      setUploadForm((prev) => ({
        ...prev,
        reportFile: files[0] || null,
      }));
      return;
    }

    setUploadForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetUploadForm = () => {
    setUploadForm(emptyUploadForm);
    const fileInput = document.getElementById("reportFileInput");
    if (fileInput) fileInput.value = "";
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
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

  const handleEditSubmit = async (event) => {
    event.preventDefault();
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

  const handleReplaceStart = (id) => {
    setReplacingId(id);
    setReplacementFile(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleReplaceCancel = () => {
    setReplacingId(null);
    setReplacementFile(null);
  };

  const handleReplaceSubmit = async (id) => {
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
      handleReplaceCancel();
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to replace report file");
    } finally {
      setReplacing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await deletePatientReport(id);
      setSuccessMessage(response.message || "Report deleted successfully");
      if (editingId === id) {
        handleCancelEdit();
      }
      if (replacingId === id) {
        handleReplaceCancel();
      }
      await loadReports();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete report");
    }
  };

  const getFileUrl = (filePath) => {
    return `${FILE_BASE_URL}${filePath}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload, update, replace, and manage your medical reports.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleUploadSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Upload New Report
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Report Title
            </label>
            <input
              type="text"
              name="title"
              value={uploadForm.title}
              onChange={handleUploadChange}
              placeholder="Blood Test Report"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Report Type
            </label>
            <input
              type="text"
              name="reportType"
              value={uploadForm.reportType}
              onChange={handleUploadChange}
              placeholder="Lab Report / Scan / Prescription"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={uploadForm.description}
            onChange={handleUploadChange}
            rows="3"
            placeholder="Add a short description for this report"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Upload File
          </label>
          <input
            id="reportFileInput"
            type="file"
            name="reportFile"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUploadChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
            required
          />
          <p className="mt-2 text-xs text-slate-500">
            Allowed files: PDF, JPG, JPEG, PNG
          </p>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </button>
        </div>
      </form>

      {editingId && (
        <form
          onSubmit={handleEditSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Edit Report Details
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Report Title
              </label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Report Type
              </label>
              <input
                type="text"
                name="reportType"
                value={editForm.reportType}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              rows="3"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={editing}
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editing ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={editing}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">No reports uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {report.title}
                      </h3>
                      <span className="rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                        {report.reportType || "Report"}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-700">File:</span>{" "}
                        {report.originalFileName}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Size:</span>{" "}
                        {report.fileSize
                          ? `${(report.fileSize / 1024).toFixed(1)} KB`
                          : "-"}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Description:
                      </span>{" "}
                      {report.description || "-"}
                    </p>

                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Uploaded:
                      </span>{" "}
                      {report.uploadedAt
                        ? new Date(report.uploadedAt).toLocaleString()
                        : "-"}
                    </p>

                    <div className="pt-1">
                      <a
                        href={getFileUrl(report.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Open File
                      </a>
                    </div>

                    {replacingId === report._id && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Choose New File
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(event) =>
                            setReplacementFile(event.target.files?.[0] || null)
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleReplaceSubmit(report._id)}
                            disabled={replacing}
                            className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {replacing ? "Replacing..." : "Confirm Replace"}
                          </button>

                          <button
                            type="button"
                            onClick={handleReplaceCancel}
                            disabled={replacing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(report)}
                      className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                    >
                      Edit Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReplaceStart(report._id)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Replace File
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(report._id)}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;