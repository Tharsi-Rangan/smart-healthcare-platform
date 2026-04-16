import { ClipboardList, Save, X } from "lucide-react";
import { MEDICAL_HISTORY_STATUS_OPTIONS } from "../../features/patient/patientConstants";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600";

function MedicalHistoryForm({ formData, editingId, submitting, maxDate, onChange, onSubmit, onCancel }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
          <ClipboardList className="h-5 w-5 text-cyan-700" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          {editingId ? "Edit Medical History Record" : "Add Medical History Record"}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Condition Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="conditionName"
            value={formData.conditionName}
            onChange={onChange}
            placeholder="e.g. Asthma, Diabetes"
            className={inputClass}
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
            onChange={onChange}
            max={maxDate}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className={inputClass}
          >
            {MEDICAL_HISTORY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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
            onChange={onChange}
            placeholder="Family doctor / Hospital / Clinic"
            className={inputClass}
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
          onChange={onChange}
          rows="3"
          placeholder="Inhaler, tablets, etc."
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows="3"
          placeholder="Additional notes about this condition"
          className={inputClass}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {submitting
            ? editingId ? "Updating..." : "Saving..."
            : editingId ? "Update Record" : "Add Record"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default MedicalHistoryForm;
