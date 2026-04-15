import { CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useMedicalHistory from "../../hooks/useMedicalHistory";
import MedicalHistoryForm from "../../components/patient/MedicalHistoryForm";
import MedicalHistoryCard from "../../components/patient/MedicalHistoryCard";
import EmptyState from "../../components/common/EmptyState";
import AnimatedContainer from "../../components/common/AnimatedContainer";
import { staggerContainer, itemVariants, alertVariants } from "../../features/patient/patientAnimations";

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
    <AnimatedContainer className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Medical History</h1>
        <p className="text-lg font-medium text-slate-500">
          Track and manage your diagnosed conditions and medications.
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
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm"
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
            className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MedicalHistoryForm
          formData={formData}
          editingId={editingId}
          submitting={submitting}
          maxDate={maxDate}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
        />
      </motion.div>

      {/* Records list */}
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Personal Medical Records
          </h2>
          <span className="rounded-xl bg-sky-50 px-4 py-1.5 text-sm font-bold text-sky-700">
            {records.length} {records.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-sky-500"></div>
            <p className="mt-4 text-sm font-medium text-slate-500">Retrieving your records...</p>
          </div>
        ) : records.length === 0 ? (
          <EmptyState 
            icon={ClipboardList}
            title="No medical records found"
            description="Your medical timeline is currently empty. Start by adding a condition or health event above."
          />
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {records.map((record) => (
              <motion.div key={record._id} variants={itemVariants}>
                <MedicalHistoryCard
                  record={record}
                  onEdit={handleEdit}
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

export default MedicalHistoryPage;