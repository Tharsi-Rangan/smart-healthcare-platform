import { motion } from "framer-motion";
import { pageVariants } from "../../features/patient/patientAnimations";

/**
 * A reusable wrapper that provides smooth fade/slide transitions to page content.
 */
function AnimatedContainer({ children, className = "" }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedContainer;
