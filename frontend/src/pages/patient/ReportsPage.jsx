import { CheckCircle, AlertCircle, FileText, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePatientReports from "../../hooks/usePatientReports";
import ReportUploadForm from "../../components/patient/ReportUploadForm";
import ReportCard from "../../components/patient/ReportCard";
import EmptyState from "../../components/common/EmptyState";
import AnimatedContainer from "../../components/common/AnimatedContainer";
import { staggerContainer, itemVariants, alertVariants } from "../../features/patient/patientAnimations";

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-sky-500 transition-colors";

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
    <AnimatedContainer className="space-y-4 pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Medical Reports</h1>
        <p className="text-base font-medium text-slate-500">
          Securely store and manage your lab results, scans, and prescriptions.
        </p>
      </div>

      {/* Alerts with AnimatePresence */}
      <AnimatePresence mode="wait">
        {successMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 shadow-sm"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ReportUploadForm
          form={uploadForm}
          uploading={uploading}
          onChange={handleUploadChange}
          onSubmit={handleUploadSubmit}
        />
      </motion.div>

      {/* Edit form — shown at top when editing a report */}
      <AnimatePresence>
        {editingId && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleEditSubmit}
            className="rounded-2xl border border-sky-200 bg-white p-4 shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Edit Report Details</h2>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Report Title <span className="text-red-400">*</span>
                </label>
                <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className={inputClass} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Report Type</label>
                <input type="text" name="reportType" value={editForm.reportType} onChange={handleEditChange} className={inputClass} />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Description</label>
              <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" className={inputClass} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={editing}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
              >
                <Save className="h-5 w-5" />
                {editing ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={editing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reports list */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">My Document Vault</h2>
          <span className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
            {reports.length} {reports.length === 1 ? "File" : "Files"}
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-sky-500"></div>
            <p className="mt-4 text-sm font-medium text-slate-500">Opening vault...</p>
          </div>
        ) : reports.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="Your vault is currently empty"
            description="Start uploading your diagnostic reports, scan results, and prescriptions for easy access anytime."
          />
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {reports.map((report) => (
              <motion.div key={report._id} variants={itemVariants}>
                <ReportCard
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AnimatedContainer>
  );
}

export default ReportsPage;