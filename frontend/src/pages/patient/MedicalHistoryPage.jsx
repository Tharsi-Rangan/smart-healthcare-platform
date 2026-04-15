import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import useMedicalHistory from "../../hooks/useMedicalHistory";
import MedicalHistoryForm from "../../components/patient/MedicalHistoryForm";
import MedicalHistoryCard from "../../components/patient/MedicalHistoryCard";
import EmptyState from "../../components/common/EmptyState";

function MedicalHistoryPage() {
  const {
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
  } = useMedicalHistory();

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
          <EmptyState 
            icon={ClipboardList}
            title="No medical records found"
            description="You haven't added any medical history entries yet. Use the form above to record your first condition."
          />
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