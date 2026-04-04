import { useEffect, useState } from "react";
import {
  fetchMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../../services/patientService";

function MedicalHistoryPage() {
  const emptyForm = {
    conditionName: "",
    diagnosisDate: "",
    status: "active",
    medications: "",
    notes: "",
    source: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [records, setRecords] = useState([]);
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (editingId) {
        const response = await updateMedicalHistory(editingId, formData);
        setSuccessMessage(response.message || "Medical history updated successfully");
      } else {
        const response = await createMedicalHistory(formData);
        setSuccessMessage(response.message || "Medical history created successfully");
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
      diagnosisDate: record.diagnosisDate
        ? new Date(record.diagnosisDate).toISOString().split("T")[0]
        : "",
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
      setSuccessMessage(response.message || "Medical history deleted successfully");

      if (editingId === id) {
        resetForm();
      }

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
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Medical History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add, update, and manage your medical history records.
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
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? "Edit Medical History Record" : "Add Medical History Record"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Condition Name
            </label>
            <input
              type="text"
              name="conditionName"
              value={formData.conditionName}
              onChange={handleChange}
              placeholder="Asthma"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Diagnosis Date
            </label>
            <input
              type="date"
              name="diagnosisDate"
              value={formData.diagnosisDate}
              onChange={handleChange}
              max={maxDate}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            >
              <option value="active">Active</option>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Family doctor / Hospital / Clinic"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Medications
          </label>
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            rows="3"
            placeholder="Inhaler, tablets, etc."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Additional notes about this condition"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
              ? "Update Record"
              : "Add Record"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

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
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No medical history records added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record._id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {record.conditionName}
                      </h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-cyan-700 border border-cyan-100">
                        {record.status}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-700">
                          Diagnosis Date:
                        </span>{" "}
                        {record.diagnosisDate
                          ? new Date(record.diagnosisDate).toLocaleDateString()
                          : "-"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Source:</span>{" "}
                        {record.source || "-"}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Medications:
                      </span>{" "}
                      {record.medications || "-"}
                    </p>

                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Notes:</span>{" "}
                      {record.notes || "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(record._id)}
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

export default MedicalHistoryPage;