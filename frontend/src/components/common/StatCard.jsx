import { motion } from "framer-motion";
import { cardHover } from "../../features/patient/patientAnimations";

/**
 * A reusable dashboard statistic card with premium animations.
 */
function StatCard({ title, value, icon: Icon, colorClass = "bg-sky-50 text-sky-600" }) {
  // Map friendly names to tailwind classes if needed, 
  // though we mostly use direct tailwind classes as defaults.
  const colorMap = {
    healthBlue: "bg-sky-50 text-sky-600",
    calmGreen: "bg-emerald-50 text-emerald-600",
  };

  const finalColorClass = colorMap[colorClass] || colorClass;

  return (
    <motion.div 
      variants={cardHover}
      whileHover="hover"
      whileTap="tap"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-tight">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${finalColorClass}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
