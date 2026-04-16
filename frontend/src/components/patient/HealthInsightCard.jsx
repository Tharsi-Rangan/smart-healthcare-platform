import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { HEALTH_INSIGHTS } from "../../features/patient/patientConstants";

/**
 * A creative dashboard component that displays rotating health insights.
 */
function HealthInsightCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HEALTH_INSIGHTS.length);
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const insight = HEALTH_INSIGHTS[index];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-sky-500 to-indigo-600 p-8 text-white shadow-lg shadow-sky-100">
      {/* Decorative background circle */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Sparkles className="h-5 w-5 text-sky-100" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-sky-100">
            Daily Health Insight
          </span>
        </div>

        <AnimatePresence mode="wait">
          <Motion.div
            key={insight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-black tracking-tight">{insight.title}</h3>
            <p className="text-lg font-medium leading-relaxed text-sky-50">
              {insight.text}
            </p>
          </Motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-200">
            {insight.category} • {index + 1}/{HEALTH_INSIGHTS.length}
          </span>
          <button 
            onClick={() => setIndex((prev) => (prev + 1) % HEALTH_INSIGHTS.length)}
            className="flex items-center gap-2 text-sm font-bold hover:text-sky-200 transition-colors"
          >
            Next Tip 
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthInsightCard;
