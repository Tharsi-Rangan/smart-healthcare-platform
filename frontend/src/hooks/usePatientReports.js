import { useEffect, useState } from "react";
import {
  fetchPatientReports,
  uploadPatientReport,
  updatePatientReport,
  replacePatientReportFile,
  deletePatientReport,
} from "../services/patientService";

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

function usePatientReports() {
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

  // Upload
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

  // Edit
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

  // Replace
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

  // Delete
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

  return {
    reports,
    loading,
    uploadForm,
    uploading,
    editingId,
    editForm,
    editing,
    replacingId,
    replacementFile,
    replacing,
    successMessage,
    errorMessage,
    handleUploadChange,
    handleUploadSubmit,
    handleStartEdit,
    handleCancelEdit,
    handleEditChange,
    handleEditSubmit,
    handleStartReplace,
    handleCancelReplace,
    handleReplacementFileChange,
    handleConfirmReplace,
    handleDelete,
  };
}

export default usePatientReports;
