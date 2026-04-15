import { CheckCircle, AlertCircle, FileText, Save, X } from "lucide-react";
import usePatientReports from "../../hooks/usePatientReports";
import ReportUploadForm from "../../components/patient/ReportUploadForm";
import ReportCard from "../../components/patient/ReportCard";
import EmptyState from "../../components/common/EmptyState";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600";

function ReportsPage() {
  const {
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
  } = usePatientReports();

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
          <EmptyState 
            icon={FileText}
            title="No reports uploaded"
            description="You haven't uploaded any medical reports yet. Keep all your lab results and scans in one place by uploading them here."
          />
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