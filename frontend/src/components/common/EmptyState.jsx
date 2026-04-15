import { motion } from "framer-motion";
import { floatIcon } from "../../features/patient/patientAnimations";

/**
 * A reusable empty state component with floating animations.
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
      {Icon && (
        <motion.div 
          variants={floatIcon}
          animate="animate"
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm"
        >
          <Icon className="h-10 w-10" />
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-3 max-w-xs text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export default EmptyState;
