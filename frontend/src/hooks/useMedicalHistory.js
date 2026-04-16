import { useEffect, useState } from "react";
import {
  fetchMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../services/patientService";
import { toDateInputValue } from "../features/patient/patientUtils";

const emptyForm = {
  conditionName: "",
  diagnosisDate: "",
  status: "active",
  medications: "",
  notes: "",
  source: "",
};

function useMedicalHistory() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const maxDate = new Date().toISOString().split("T")[0];

  const loadMedicalHistory = async () => {
    try {
      const response = await fetchMedicalHistory();
      setRecords(response.data.entries || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load medical history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (editingId) {
        const response = await updateMedicalHistory(editingId, formData);
        setSuccessMessage(response.message || "Medical history updated successfully");
      } else {
        const response = await createMedicalHistory(formData);
        setSuccessMessage(response.message || "Medical history record added successfully");
      }
      resetForm();
      await loadMedicalHistory();
    } catch (error) {
      setErrorMessage(error.message || "Failed to save medical history");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setSuccessMessage("");
    setErrorMessage("");
    setEditingId(record._id);
    setFormData({
      conditionName: record.conditionName || "",
      diagnosisDate: toDateInputValue(record.diagnosisDate),
      status: record.status || "active",
      medications: record.medications || "",
      notes: record.notes || "",
      source: record.source || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medical history record?"
    );
    if (!confirmed) return;

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await deleteMedicalHistory(id);
      setSuccessMessage(response.message || "Medical history record deleted");
      if (editingId === id) resetForm();
      await loadMedicalHistory();
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete medical history");
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setSuccessMessage("");
    setErrorMessage("");
  };

  return {
    records,
    formData,
    loading,
    submitting,
    editingId,
    successMessage,
    errorMessage,
    maxDate,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancelEdit,
  };
}

export default useMedicalHistory;
