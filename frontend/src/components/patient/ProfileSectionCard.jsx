import { motion } from "framer-motion";

/**
 * A reusable card wrapper for profile sections.
 * Optimized for readability and premium feel.
 */
function ProfileSectionCard({ title, children, className = "" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {title && (
        <div className="mb-8 border-b border-slate-50 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

export default ProfileSectionCard;
