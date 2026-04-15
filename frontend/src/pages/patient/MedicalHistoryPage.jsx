import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import {
  fetchMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../../services/patientService";
import { toDateInputValue } from "../../features/patient/patientUtils";
import MedicalHistoryForm from "../../components/patient/MedicalHistoryForm";
import MedicalHistoryCard from "../../components/patient/MedicalHistoryCard";

const emptyForm = {
  conditionName: "",
  diagnosisDate: "",
  status: "active",
  medications: "",
  notes: "",
  source: "",
};

const maxDate = new Date().toISOString().split("T")[0];

function MedicalHistoryPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Medical History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add, update, and manage your medical history records.
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

      {/* Form */}
      <MedicalHistoryForm
        formData={formData}
        editingId={editingId}
        submitting={submitting}
        maxDate={maxDate}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancelEdit}
      />

      {/* Records list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            My Medical History Records
          </h2>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {records.length} record{records.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading medical history...</p>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <ClipboardList className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              No medical history records added yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Use the form above to add your first record.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <MedicalHistoryCard
                key={record._id}
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalHistoryPage;